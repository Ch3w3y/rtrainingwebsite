# plumber.R

library(plumber)
library(ggplot2)
library(sf)
library(rnaturalearth)
library(rnaturalearthdata)
library(viridis)
library(scales)
library(reshape2) # Added reshape2 for the heatmap melt

#* @apiTitle ggplot2 Plot Generator API

# --- Plot for Introduction Section ---

#* Generate basic scatter plot
#* @serializer png list(width = 600, height = 400)
#* @get /plot/basic-scatter
function() {
  p <- ggplot(data = mtcars, aes(x = wt, y = mpg)) +
    geom_point() +
    theme_minimal(base_size = 14) # Added theme for better default look
  print(p) # IMPORTANT: Plumber needs the plot object to be printed
}

# --- Plot for Grammar of Graphics Section ---

#* Generate scatter plot with layers
#* @serializer png list(width = 600, height = 400)
#* @get /plot/layers-example
function() {
  p <- ggplot(mtcars, aes(x = wt, y = mpg)) +
    geom_point() +
    geom_smooth(method = "lm") +  # Add a linear model trendline
    labs(
      title = "Car Weight vs. Fuel Efficiency",
      x = "Weight (1000 lbs)",
      y = "Miles per Gallon"
    ) +
    theme_minimal(base_size = 14)
  print(p)
}

# --- Plots for Basic Plot Types Section ---

#* Generate enhanced scatter plot
#* @serializer png list(width = 300, height = 250)
# Smaller size for comparison grid  <- COMMENT MOVED TO NEW LINE
#* @get /plot/scatter-enhanced
function() {
  p <- ggplot(mtcars, aes(x = wt, y = mpg, color = as.factor(cyl), size = hp)) +
    geom_point(alpha = 0.7) +
    labs(color = "Cylinders", size = "Horsepower") +
    theme_minimal(base_size = 10) + # Adjust theme for smaller size
    theme(legend.position = "bottom")
  print(p)
}

#* Generate bar chart (counts)
#* @serializer png list(width = 300, height = 250)
#* @get /plot/bar-chart
function() {
  p <- ggplot(mtcars, aes(x = as.factor(cyl))) +
    geom_bar() +
    labs(x = "Number of Cylinders", y = "Count") +
    theme_minimal(base_size = 10)
  print(p)
}

#* Generate histogram
#* @serializer png list(width = 300, height = 250)
#* @get /plot/histogram
function() {
  p <- ggplot(mtcars, aes(x = mpg)) +
    geom_histogram(bins = 10, fill = "skyblue", color = "black") +
    labs(title = "Distribution of MPG", x = "Miles per Gallon", y = "Count") +
    theme_minimal(base_size = 10) +
    theme(plot.title = element_text(size = 10)) # Adjust title size
  print(p)
}

#* Generate box plot
#* @serializer png list(width = 300, height = 250)
#* @get /plot/boxplot
function() {
  p <- ggplot(mtcars, aes(x = as.factor(cyl), y = mpg)) +
    geom_boxplot() +
    labs(title = "MPG Distribution by Cylinder",
         x = "Cylinders",
         y = "MPG") +
    theme_minimal(base_size = 10) +
    theme(plot.title = element_text(size = 10))
  print(p)
}

# --- Plot for Customization Section ---

#* Generate faceted scatter plot
#* @serializer png list(width = 600, height = 400)
#* @get /plot/facets-example
function() {
  p <- ggplot(mtcars, aes(x = wt, y = mpg)) +
    geom_point() +
    facet_wrap(~ cyl) +
    labs(title = "Car Weight vs. MPG by Cylinder Count") +
    theme_minimal(base_size = 14)
  print(p)
}

# --- Plot for Complex Visualizations Section ---

#* Generate correlation heatmap
#* @serializer png list(width = 600, height = 500) # Needs a bit more height
#* @get /plot/complex-heatmap
function() {
  cor_matrix <- round(cor(mtcars), 2)
  # Reshape requires tidyr or similar, let's use base R melt alternative
  cor_data <- reshape2::melt(cor_matrix)
  names(cor_data) <- c("Var1", "Var2", "Correlation")

  p <- ggplot(cor_data, aes(x = Var1, y = Var2, fill = Correlation)) +
    geom_tile(color = "white") + # Add white lines between tiles
    scale_fill_gradient2(
      low = "blue",
      mid = "white",
      high = "red",
      midpoint = 0,
      limit = c(-1,1) # Ensure scale covers full range
    ) +
    geom_text(aes(label = Correlation), color = "black", size = 3) +
    theme_minimal(base_size = 12) +
    theme(
      axis.text.x = element_text(angle = 45, vjust = 1, hjust = 1),
      axis.title.x = element_blank(), # Remove axis titles for heatmap
      axis.title.y = element_blank(),
      panel.grid.major = element_blank(),
      legend.position = "right"
    ) +
    labs(title = "Correlation Matrix of Car Variables") +
    coord_fixed() # Make tiles square
  print(p)
}

# --- Plots for Spatial Data Section ---

#* Generate basic world map
#* @serializer png list(width = 400, height = 250)
#* @get /plot/map-world
function() {
  world <- ne_countries(scale = "medium", returnclass = "sf")
  p <- ggplot(data = world) +
    geom_sf(fill = "gray80", color = "white") + # Basic styling
    theme_void() + # Minimal theme for maps
    labs(title = "World Map")
  print(p)
}

#* Generate choropleth world map
#* @serializer png list(width = 400, height = 250)
#* @get /plot/map-choropleth
function() {
  world <- ne_countries(scale = "medium", returnclass = "sf")
  p <- ggplot(data = world) +
    geom_sf(aes(fill = pop_est)) +
    scale_fill_viridis_c(
      trans = "log10",
      label = scales::comma,
      name = "Population",
      na.value = "gray80" # Color for countries with no data
    ) +
    theme_void() +
    labs(title = "World Population (Log Scale)") +
    theme(legend.position = "bottom")
  print(p)
}


# --- Static File Serving ---
# This tells Plumber to also serve static files (like your HTML, CSS, JS)
# from the directory where plumber.R is located.
#* @assets ./ /
list()
