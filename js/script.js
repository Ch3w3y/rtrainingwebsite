// --- Common Utility Functions ---

/**
 * Generic function to check multiple-choice answers.
 * @param {string} questionId - The name attribute of the radio button group.
 * @param {string} correctAnswer - The value of the correct radio button.
 */
function checkAnswer(questionId, correctAnswer) {
    const selectedOption = document.querySelector(
        `input[name="${questionId}"]:checked`,
    );
    const resultDiv = document.getElementById(`${questionId}-result`);
    if (!resultDiv) {
        console.error("Result div not found for:", questionId);
        return;
    }

    resultDiv.style.display = "block"; // Show result area
    if (!selectedOption) {
        resultDiv.textContent = "Please select an answer.";
        resultDiv.className = "result incorrect";
    } else if (selectedOption.value === correctAnswer) {
        resultDiv.textContent = "Correct! Well done.";
        resultDiv.className = "result correct";
    } else {
        // Attempt to find the label for the correct answer for better feedback
        let answerText = correctAnswer; // Default to the value
        try {
             // Find the radio button with the correct value
             const correctRadio = document.querySelector(`input[name="${questionId}"][value="${correctAnswer}"]`);
             if (correctRadio && correctRadio.id) {
                 // Find the label associated with that radio button
                 const correctLabel = document.querySelector(`label[for="${correctRadio.id}"]`);
                 if (correctLabel) {
                     answerText = correctLabel.textContent.trim();
                 }
             }
        } catch (e) {
            console.warn("Could not find label for correct answer:", questionId, correctAnswer);
        }
        resultDiv.textContent = `Incorrect. The correct answer is: ${answerText}`;
        resultDiv.className = "result incorrect";
    }
}

/**
 * Toggles the display of a solution element and updates button text.
 * Assumes the button is the immediately preceding sibling of the solution div.
 * @param {string} solutionId - The ID of the solution div to toggle.
 */
function toggleSolution(solutionId) {
    const element = document.getElementById(solutionId);
    if (!element) {
        console.error("Solution element not found:", solutionId);
        return;
    }
    // Find the button - more robustly search previous siblings
    let button = element.previousElementSibling;
    while (button && button.tagName !== 'BUTTON' && !button.classList.contains('check-answer')) {
        button = button.previousElementSibling;
    }

    const isHidden = element.style.display === "none" || element.style.display === "";

    element.style.display = isHidden ? "block" : "none";
    if (button) {
        button.textContent = isHidden ? "Hide Solution" : "Show Solution";
    }
}


/**
 * Shows a specific tab content and highlights the active tab button.
 * @param {string} tabId - The ID of the tab content pane to show.
 * @param {HTMLElement} clickedTab - The tab button element that was clicked.
 */
function showTab(tabId, clickedTab) {
    // Hide all tab content within the same parent container
    const tabContainer = clickedTab.closest('.tab-container') || clickedTab.closest('.tabs')?.parentElement;
    if (!tabContainer) return;

    const tabContents = tabContainer.querySelectorAll(".tab-content, .tab-pane");
    tabContents.forEach(tc => tc.classList.remove("active"));

    // Deactivate all tab buttons within the same nav
    const tabNav = clickedTab.parentElement;
    const tabs = tabNav.querySelectorAll(".tab, .tab-btn");
    tabs.forEach(t => t.classList.remove("active"));

    // Show the selected tab content
    const selectedTabContent = tabContainer.querySelector("#" + tabId);
    if (selectedTabContent) {
        selectedTabContent.classList.add("active");
    }

    // Activate the clicked tab button
    clickedTab.classList.add("active");
}

/**
 * Helper function to display exercise results.
 * @param {string} resultId - The ID of the div to display the result in.
 * @param {boolean} isCorrect - Whether the user's answer is correct.
 * @param {string} message - The feedback message to display.
 */
function displayResult(resultId, isCorrect, message) {
    const resultElem = document.getElementById(resultId);
    if (!resultElem) {
        console.error("Result element not found for exercise:", resultId);
        return;
    }
    resultElem.innerHTML = message; // Use innerHTML to allow potential formatting
    resultElem.style.display = "block";
    resultElem.className = isCorrect ? "result correct" : "result incorrect";
}


// --- Specific Exercise Checkers ---
// (Moved from individual HTML files)

// From data-cleaning.html (No specific checkers found in OCR)

// From data-import.html
function checkExcelExercise() {
    const userCode = document.getElementById("excel-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("excel-exercise-result");
    // More robust check for comma between arguments
    const pattern1 = /read_excel\s*\(\s*file\s*=\s*["']sales_data\.xlsx["']\s*,\s*sheet\s*=\s*1\s*\)/;
    const pattern2 = /read_excel\s*\(\s*["']sales_data\.xlsx["']\s*,\s*sheet\s*=\s*1\s*\)/;
    if (pattern1.test(userCode) || pattern2.test(userCode)) {
        displayResult("excel-exercise-result", true, "Correct! You've correctly specified the file and sheet, ensuring the comma is present.");
    } else {
        displayResult("excel-exercise-result", false, "Not quite right. Ensure you use `read_excel`, specify the file (e.g., `file = \"sales_data.xlsx\"` or just the path) and the sheet (`sheet = 1`), separated by a comma.");
    }
}

function checkExportExercise() {
    const userCode = document.getElementById("export-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("export-exercise-result");
    if (userCode.includes("write.csv") && userCode.includes("row.names") && userCode.includes("FALSE")) {
         displayResult("export-exercise-result", true, "Correct! Adding `row.names = FALSE` prevents writing the row names to the CSV file.");
    } else {
         displayResult("export-exercise-result", false, "Not quite right. You need to add `row.names = FALSE` to the `write.csv()` function call.");
    }
}

// From data-types.html
function checkVectorExercise() {
    // This was a placeholder - real checking needs R execution.
    // We'll provide generic feedback based on common patterns.
    const userCode = document.getElementById("vector-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("vector-exercise-result");
    const hasSeq = /seq\s*\(.*2.*,.*10.*,.*(by\s*=\s*2|2)\s*\)/.test(userCode);
    const hasC = /c\s*\(\s*2\s*,\s*4\s*,\s*6\s*,\s*8\s*,\s*10\s*\)/.test(userCode);

    if (hasSeq || hasC) {
        displayResult("vector-exercise-result", true, "Looks correct! This code should generate the vector c(2, 4, 6, 8, 10).");
    } else if (userCode.includes("seq") && !userCode.includes(")")) {
        displayResult("vector-exercise-result", false, "Looks like you might be missing a closing parenthesis ')' in your seq() function.");
    } else {
        displayResult("vector-exercise-result", false, "Not quite right, or not in a recognized format. Common ways are using `seq(2, 10, by=2)` or `c(2, 4, 6, 8, 10)`.");
    }
}

// From index.html (No specific checkers)

// From Machine_Learning_Tidymodels.html (No specific checkers)

// From programmatic_r.html
function checkLoopsExercise() {
    const userCode = document.getElementById("loops-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("loops-exercise-result");
    if (userCode.includes("for") && userCode.includes("in 1:10") && (userCode.includes("i^2") || userCode.includes("i*i")) && userCode.includes("print")) {
        displayResult("loops-exercise-result", true, "Correct! You've written a for loop to print the squares of numbers.");
    } else {
        displayResult("loops-exercise-result", false, "Not quite right. Make sure you have a `for` loop iterating from 1 to 10 and print `i^2` inside the loop.");
    }
}

function checkNestedLoopsExercise() {
    const userCode = document.getElementById("nested-loops-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("nested-loops-exercise-result");
    if (userCode.includes("for") && userCode.includes("in 1:5") && userCode.includes("i * j") && userCode.includes("print")) {
        // Basic check, assumes two nested loops 1:5
        displayResult("nested-loops-exercise-result", true, "Correct! You've created a nested loop structure. Ensure it prints `i * j` to generate the table.");
    } else {
        displayResult("nested-loops-exercise-result", false, "Not quite right. Make sure to use nested `for` loops (e.g., `for (i in 1:5)` and `for (j in 1:5)`) and calculate/print `i * j`.");
    }
}

function checkConditionalStatementsExercise() {
    const userCode = document.getElementById("conditional-statements-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("conditional-statements-exercise-result");
    if (userCode.includes("if") && userCode.includes("%% 2 == 0") && userCode.includes("else") && (userCode.includes("even") || userCode.includes("odd"))) {
        displayResult("conditional-statements-exercise-result", true, "Correct! You've written an if-else statement using the modulo operator `%%` to check for even or odd numbers.");
    } else {
        displayResult("conditional-statements-exercise-result", false, "Not quite right. Make sure to use `if (x %% 2 == 0)` to check for even numbers and include both `if` and `else` clauses.");
    }
}

function checkCaseWhenExercise() {
    const userCode = document.getElementById("case-when-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("case-when-exercise-result");
    // Check for case_when and presence of key thresholds/labels
    if (userCode.includes("case_when") && userCode.includes("< 32") && userCode.includes(">= 32") && userCode.includes(">= 50") && userCode.includes(">= 70") && userCode.includes("> 85") && userCode.includes("Freezing") && userCode.includes("Hot")) {
        displayResult("case-when-exercise-result", true, "Correct! You've created a `case_when` statement with conditions covering the required temperature categories.");
    } else {
        displayResult("case-when-exercise-result", false, "Not quite right. Make sure to use `case_when` and include conditions for all temperature categories (Freezing, Cold, Mild, Warm, Hot) with the correct thresholds.");
    }
}

function checkFunctionExercise() {
    const userCode = document.getElementById("function-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("function-exercise-result");
    if (userCode.includes("calculate_bmi") && userCode.includes("function") && userCode.includes("weight") && userCode.includes("height") && (userCode.includes("weight / (height^2)") || userCode.includes("weight / height**2") || userCode.includes("weight / (height * height)")) && userCode.includes("round")) {
        displayResult("function-exercise-result", true, "Correct! You've created a function named `calculate_bmi` that takes height and weight, calculates BMI, and rounds the result.");
    } else {
        displayResult("function-exercise-result", false, "Not quite right. Ensure your function is named `calculate_bmi`, takes `height` and `weight` arguments, calculates `weight / height^2`, and uses `round()`.");
    }
}

function checkFunctionalProgrammingExercise() {
    const userCode = document.getElementById("functional-programming-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("functional-programming-exercise-result");
    if (userCode.includes("map") && userCode.includes("numbers") && (userCode.includes("sqrt") || userCode.includes(".x^0.5") || userCode.includes(".x**0.5"))) {
         displayResult("functional-programming-exercise-result", true, "Correct! You've used a `map` function (like `map()` or `map_dbl()`) with `sqrt` or an equivalent calculation.");
    } else {
         displayResult("functional-programming-exercise-result", false, "Not quite right. Make sure to use a function from the `map` family (e.g., `map_dbl(numbers, sqrt)`) or an equivalent lambda expression like `map_dbl(numbers, ~ sqrt(.x))`.");
    }
}

function checkPmapExercise() {
    const userCode = document.getElementById("pmap-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("pmap-exercise-result");
    if (userCode.includes("pmap") && userCode.includes("products") && userCode.includes("price") && userCode.includes("tax") && userCode.includes("discount") && userCode.includes("1 - disc") && userCode.includes("1 + tax")) {
        displayResult("pmap-exercise-result", true, "Correct! You've used `pmap` (likely `pmap_dbl`) to iterate through the product list and apply the correct pricing formula.");
    } else {
        displayResult("pmap-exercise-result", false, "Not quite right. Make sure to use `pmap` (e.g., `pmap_dbl`) on the `products` list and apply the formula: `(price * (1 - discount)) * (1 + tax)` inside the function.");
    }
}

function checkErrorHandlingExercise() {
    const userCode = document.getElementById("error-handling-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("error-handling-exercise-result");
    if ((userCode.includes("safely") || userCode.includes("possibly")) && userCode.includes("log") && userCode.includes("NA")) {
        displayResult("error-handling-exercise-result", true, "Correct! You've used an error handling function like `safely` or `possibly` with `log` and returned `NA` for invalid inputs.");
    } else {
        displayResult("error-handling-exercise-result", false, "Not quite right. Use `safely(log)` or `possibly(log, otherwise = NA)` and apply it to the vector (e.g., using `map`). Ensure invalid inputs result in `NA`.");
    }
}

function checkFileProcessingExercise() {
    const userCode = document.getElementById("file-processing-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("file-processing-exercise-result");
    // Basic checks for key functions/concepts
    if (userCode.includes("list.files") && (userCode.includes("map_df") || (userCode.includes("map") && userCode.includes("bind_rows"))) && userCode.includes("read.csv") && userCode.includes("group_by") && userCode.includes("category") && userCode.includes("summarize") && userCode.includes("mean") && userCode.includes("sum") && userCode.includes("n()") && userCode.includes("write.csv")) {
        displayResult("file-processing-exercise-result", true, "Looks good! Your script seems to include the key steps: listing files, reading/combining CSVs, grouping by category, summarizing (count, mean, sum), and writing the result.");
    } else {
        displayResult("file-processing-exercise-result", false, "Not quite right. Ensure your script uses `list.files`, reads and combines the data (e.g., with `map_df` or `map`+`bind_rows`), uses `group_by(category)` and `summarize()` to calculate count, mean, and sum of 'value', and finally uses `write.csv`.");
    }
}

// From r-basics.html
function checkFunctionExercise_rbasics() { // Renamed to avoid conflict
    const code = document.getElementById("func-exercise")?.value.trim() || ""; // ID might need checking if reused
    const resultElement = document.getElementById("func-exercise-result"); // ID might need checking
    if (!resultElement) return;

    if (code.includes("is_even") && code.includes("function") && code.includes("number") && code.includes("%% 2 == 0") && (code.includes("TRUE") || code.includes("return(TRUE)")) && (code.includes("FALSE") || code.includes("return(FALSE)"))) {
        displayResult("func-exercise-result", true, "Good job! Your function `is_even` correctly checks for even numbers using the modulo operator.");
    } else {
        displayResult("func-exercise-result", false, "Your function doesn't seem to meet all requirements. Check that it's named 'is_even', takes one argument, uses `%% 2 == 0` to check, and returns TRUE/FALSE.");
    }
}
// Add event listener if the button ID is unique or adjust selector
// document.getElementById('checkFuncBtn_rbasics')?.addEventListener('click', checkFunctionExercise_rbasics);


// From rmarkdown.html
function checkIntroExercise() {
    const userCode = document.getElementById("intro-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("intro-exercise-result");
    const hasYamlHeader = /---[\s\S]*title:[\s\S]*author:[\s\S]*date:[\s\S]*output:\s*html_document[\s\S]*---/.test(userCode);
    const hasDataAnalysisHeading = /##\s*Data Analysis/.test(userCode); // Level 2 heading
    const hasMtcarsChunk = /```\{r[\s\S]*mtcars[\s\S]*mean\(mtcars\$mpg\)[\s\S]*```/.test(userCode);
    const hasConclusion = /(Conclusion|Summary|Finding|Result)[\s\S]*mean MPG/i.test(userCode.substring(userCode.lastIndexOf("```") || 0)); // Check text after last chunk

    if (hasYamlHeader && hasDataAnalysisHeading && hasMtcarsChunk && hasConclusion) {
        displayResult("intro-exercise-result", true, "Correct! Your R Markdown document contains all the required elements: YAML header, Data Analysis section (##), code chunk with mtcars and mean MPG calculation, and a conclusion.");
    } else {
        let feedback = "Your solution is missing some elements: ";
        if (!hasYamlHeader) feedback += "YAML header (--- block) with title, author, date, and html_document output; ";
        if (!hasDataAnalysisHeading) feedback += "Level 2 heading (## Data Analysis); ";
        if (!hasMtcarsChunk) feedback += "R code chunk loading mtcars and calculating mean(mtcars$mpg); ";
        if (!hasConclusion) feedback += "Conclusion paragraph mentioning the findings; ";
        displayResult("intro-exercise-result", false, feedback);
    }
}

function checkYamlExercise() {
    const userCode = document.getElementById("yaml-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("yaml-exercise-result");
    const hasTitle = /title:\s*["']?Sales Analysis Report["']?/i.test(userCode);
    const hasFloatingToc = /(toc:\s*true[\s\S]*toc_float:\s*true|toc_float:\s*true[\s\S]*toc:\s*true)/i.test(userCode);
    const hasTocDepth = /toc_depth:\s*2/.test(userCode);
    const hasNumberSections = /number_sections:\s*true/i.test(userCode);
    const hasFlatlyTheme = /theme:\s*["']?flatly["']?/i.test(userCode);
    const hasCodeFolding = /code_folding:\s*["']?hide["']?/i.test(userCode); // hide = collapsed by default
    const hasQuarterParam = /params:[\s\S]*quarter:\s*["']?Q1["']?/i.test(userCode);

    if (hasTitle && hasFloatingToc && hasTocDepth && hasNumberSections && hasFlatlyTheme && hasCodeFolding && hasQuarterParam) {
        displayResult("yaml-exercise-result", true, "Correct! Your YAML header includes all the required elements and configurations.");
    } else {
        let feedback = "Your YAML header is missing some required elements: ";
        if (!hasTitle) feedback += "title 'Sales Analysis Report'; ";
        if (!hasFloatingToc) feedback += "floating table of contents (toc: true, toc_float: true); ";
        if (!hasTocDepth) feedback += "TOC depth of 2 (toc_depth: 2); ";
        if (!hasNumberSections) feedback += "section numbering (number_sections: true); ";
        if (!hasFlatlyTheme) feedback += "'flatly' theme (theme: flatly); ";
        if (!hasCodeFolding) feedback += "collapsible code sections, hidden by default (code_folding: hide); ";
        if (!hasQuarterParam) feedback += "quarter parameter with default value 'Q1' (params: \n  quarter: Q1); ";
        displayResult("yaml-exercise-result", false, feedback);
    }
}

function checkChunksExercise() {
    const userCode = document.getElementById("chunks-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("chunks-exercise-result");
    const hasSetupChunk = /```\{r\s+setup[\s\S]*opts_chunk\$set\([\s\S]*warning\s*=\s*FALSE[\s\S]*message\s*=\s*FALSE[\s\S]*fig\.align\s*=\s*["']center["']?[\s\S]*\)[\s\S]*```/.test(userCode);
    const hasGgplot2Chunk = /```\{r[\s\S]*(echo\s*=\s*FALSE)?[\s\S]*(message\s*=\s*FALSE)?[\s\S]*library\(ggplot2\)[\s\S]*```/.test(userCode);
    const hasHistogramChunk = /```\{r[\s\S]*fig\.width\s*=\s*10[\s\S]*fig\.height\s*=\s*6[\s\S]*hist\(mtcars\$mpg\)[\s\S]*```/.test(userCode);

    if (hasSetupChunk && hasGgplot2Chunk && hasHistogramChunk) {
        displayResult("chunks-exercise-result", true, "Correct! Your code chunks correctly implement the setup options, load ggplot2 silently (or without messages/code), and create the histogram with specified dimensions.");
    } else {
        let feedback = "Your solution is missing some required code chunks or options: ";
        if (!hasSetupChunk) feedback += "Setup chunk suppressing warnings/messages and centering figures; ";
        if (!hasGgplot2Chunk) feedback += "Chunk loading ggplot2 without showing code or messages (echo=FALSE, message=FALSE); ";
        if (!hasHistogramChunk) feedback += "Chunk creating histogram of mtcars$mpg with fig.width=10, fig.height=6; ";
        displayResult("chunks-exercise-result", false, feedback);
    }
}

function checkMarkdownExercise() {
    const userCode = document.getElementById("markdown-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("markdown-exercise-result");
    const hasHeading = /^##\s+Data Analysis Results/m.test(userCode);
    const hasParagraph = /##\s+Data Analysis Results\s*\n+([^\n]+)\n+/m.test(userCode); // Basic check for text after heading
    const hasBulletList = /(\n\s*(\*|\-|\+)\s+[^\n]+){3,}/m.test(userCode); // At least 3 bullet points
    const hasTable = /\|\s*Region\s*\|/i.test(userCode) && /\|\s*---+\s*\|/.test(userCode) && /(\|\s*[^\n|]+\s*\|){2,}/m.test(userCode); // Header, separator, body rows
    const hasLink = /\[more information\]\(http[s]?:\/\/[^)]+\)/i.test(userCode);

    if (hasHeading && hasParagraph && hasBulletList && hasTable && hasLink) {
        displayResult("markdown-exercise-result", true, "Correct! Your markdown formatting includes all required elements: level 2 heading, paragraph, bullet list, table, and link.");
    } else {
        let feedback = "Your solution is missing some markdown elements: ";
        if (!hasHeading) feedback += "Level 2 heading (## Data Analysis Results); ";
        if (!hasParagraph) feedback += "Explanatory paragraph after heading; ";
        if (!hasBulletList) feedback += "Bulleted list with three findings; ";
        if (!hasTable) feedback += "Table showing results for different regions; ";
        if (!hasLink) feedback += "Link to 'more information'; ";
        displayResult("markdown-exercise-result", false, feedback);
    }
}

function checkOutputFormatsExercise() {
    const userCode = document.getElementById("output-formats-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("output-formats-exercise-result");
    const hasHtmlOutput = /output:[\s\S]*html_document:/m.test(userCode);
    const hasHtmlTocFloat = /html_document:[\s\S]*(toc:\s*true[\s\S]*toc_float:\s*true|toc_float:\s*true[\s\S]*toc:\s*true)/im.test(userCode);
    const hasFlatlyTheme = /html_document:[\s\S]*theme:\s*["']?flatly["']?/im.test(userCode);
    const hasCodeFolding = /html_document:[\s\S]*code_folding:\s*["']?show["']?/im.test(userCode);
    const hasPdfOutput = /output:[\s\S]*pdf_document:/m.test(userCode);
    const hasPdfToc = /pdf_document:[\s\S]*toc:\s*true/im.test(userCode);
    const hasXeLaTeX = /pdf_document:[\s\S]*latex_engine:\s*["']?xelatex["']?/im.test(userCode);
    const hasFigCaptions = /pdf_document:[\s\S]*fig_caption:\s*true/im.test(userCode);

    if (hasHtmlOutput && hasHtmlTocFloat && hasFlatlyTheme && hasCodeFolding && hasPdfOutput && hasPdfToc && hasXeLaTeX && hasFigCaptions) {
        displayResult("output-formats-exercise-result", true, "Correct! Your YAML header correctly specifies both HTML and PDF output formats with all required options.");
    } else {
        let feedback = "Your YAML header is missing some required output format specifications: ";
        if (!hasHtmlOutput) feedback += "HTML output format (`html_document:`); ";
        else {
            if (!hasHtmlTocFloat) feedback += "HTML floating TOC (`toc: true`, `toc_float: true`); ";
            if (!hasFlatlyTheme) feedback += "HTML 'flatly' theme (`theme: flatly`); ";
            if (!hasCodeFolding) feedback += "HTML code folding set to 'show' (`code_folding: show`); ";
        }
        if (!hasPdfOutput) feedback += "PDF output format (`pdf_document:`); ";
        else {
            if (!hasPdfToc) feedback += "PDF table of contents (`toc: true`); ";
            if (!hasXeLaTeX) feedback += "PDF 'xelatex' engine (`latex_engine: xelatex`); ";
            if (!hasFigCaptions) feedback += "PDF figure captions (`fig_caption: true`); ";
        }
        displayResult("output-formats-exercise-result", false, feedback);
    }
}

function checkKnitrExercise() {
    const userCode = document.getElementById("knitr-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("knitr-exercise-result");
    const hasSetupChunk = /```\{r\s+setup[\s\S]*opts_chunk\$set\([\s\S]*cache\s*=\s*TRUE[\s\S]*dev\s*=\s*["']png["'][\s\S]*dpi\s*=\s*300[\s\S]*fig\.align\s*=\s*["']center["']?[\s\S]*\)[\s\S]*```/.test(userCode);
    const hasImageChunk = /```\{r[\s\S]*knitr::include_graphics\(["']logo\.png["']\)[\s\S]*out\.width\s*=\s*["']50%["'][\s\S]*```/.test(userCode);
    const hasKableChunk = /```\{r[\s\S]*knitr::kable\(head\(mtcars\)\)[\s\S]*caption\s*=\s*["']Car Performance Data["'][\s\S]*```/.test(userCode); // Simplified check

    if (hasSetupChunk && hasImageChunk && hasKableChunk) {
        displayResult("knitr-exercise-result", true, "Correct! Your knitr code includes all required elements: a setup chunk with appropriate options, image inclusion, and a table with caption.");
    } else {
        let feedback = "Your solution is missing some required knitr elements: ";
        if (!hasSetupChunk) feedback += "Setup chunk with cache=TRUE, dev='png', dpi=300, fig.align='center'; ";
        if (!hasImageChunk) feedback += "Chunk including 'logo.png' with out.width='50%'; ";
        if (!hasKableChunk) feedback += "Chunk creating a kable table from `head(mtcars)` with caption 'Car Performance Data'; ";
        displayResult("knitr-exercise-result", false, feedback);
    }
}

function checkPandocExercise() {
    const userCode = document.getElementById("pandoc-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("pandoc-exercise-result");
    const hasPdfMargins = /(pdf_document:[\s\S]*geometry:\s*["']?margin=1\.5in["']?|geometry:\s*["']?margin=1\.5in["']?|pandoc_args:[\s\S]*--variable=geometry:margin=1\.5in)/im.test(userCode);
    const hasHtmlCss = /html_document:[\s\S]*css:\s*["']?custom\.css["']?/im.test(userCode);
    const hasFontSize = /(pdf_document:|html_document:)[\s\S]*(fontsize:\s*["']?11pt["']?|classoption:.*11pt.*|pandoc_args:[\s\S]*--variable=fontsize:11pt)/im.test(userCode);

    if (hasPdfMargins && hasHtmlCss && hasFontSize) {
        displayResult("pandoc-exercise-result", true, "Correct! Your YAML header includes Pandoc options for 1.5 inch margins (PDF), custom CSS (HTML), and 11pt font size.");
    } else {
        let feedback = "Your YAML header is missing some required Pandoc options: ";
        if (!hasPdfMargins) feedback += "Setting margins to 1.5 inches for PDF (e.g., using `geometry: margin=1.5in` or `pandoc_args`); ";
        if (!hasHtmlCss) feedback += "Adding `custom.css` file to HTML (`css: custom.css`); ";
        if (!hasFontSize) feedback += "Specifying 11pt font size (e.g., `fontsize: 11pt` or via `pandoc_args`); ";
        displayResult("pandoc-exercise-result", false, feedback);
    }
}

function checkParamsExercise() {
    const userCode = document.getElementById("params-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("params-exercise-result");
    const hasDepartmentParam = /params:[\s\S]*department:\s*["']?Sales["']?/i.test(userCode);
    // More robust check for current year default
    const hasYearParam = /params:[\s\S]*year:\s*(!r\s*as\.numeric\(format\(Sys\.Date\(\),\s*["']%Y["']\)\)|\d{4})/i.test(userCode);
    const hasIncludeChartsParam = /params:[\s\S]*include_charts:\s*(TRUE|true)/i.test(userCode);
    const hasDataSourceParam = /params:[\s\S]*data_source:[\s\S]*input:\s*select[\s\S]*choices:\s*\[["']?Database["']?,\s*["']?CSV["']?,\s*["']?API["']?\]/im.test(userCode);

    if (hasDepartmentParam && hasYearParam && hasIncludeChartsParam && hasDataSourceParam) {
        displayResult("params-exercise-result", true, "Correct! Your YAML header includes all required parameters with appropriate defaults and configurations (assuming year defaults correctly).");
    } else {
        let feedback = "Your YAML header is missing some required parameters: ";
        if (!hasDepartmentParam) feedback += "`department` parameter with default 'Sales'; ";
        if (!hasYearParam) feedback += "`year` parameter defaulting to the current year (e.g., using `!r as.numeric(format(Sys.Date(), '%Y'))`); ";
        if (!hasIncludeChartsParam) feedback += "`include_charts` boolean parameter defaulting to TRUE; ";
        if (!hasDataSourceParam) feedback += "`data_source` parameter with select input and options 'Database', 'CSV', 'API'; ";
        displayResult("params-exercise-result", false, feedback);
    }
}

function checkTablesExercise() {
    const userCode = document.getElementById("tables-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("tables-exercise-result");
    const hasKable = /knitr::kable\(head\(iris.*\)\s*,\s*caption\s*=\s*["'][^"']+["']\)/i.test(userCode);
    const hasKableExtra = /kableExtra::kable_styling\([\s\S]*(bootstrap_options\s*=\s*c\(.*["']striped["']|stripe\s*=\s*)/i.test(userCode);
    const hasBoldColumn = /column_spec\(1,\s*bold\s*=\s*TRUE\)/i.test(userCode);
    // Summary row check is complex via regex, basic check for concept
    const hasSummaryConcept = /(summarise|summarize|aggregate|add_row|rbind)[\s\S]*mean/i.test(userCode);

    if (hasKable && hasKableExtra && hasBoldColumn && hasSummaryConcept) {
        displayResult("tables-exercise-result", true, "Looks good! Your code seems to include kable with a caption, kableExtra styling for stripes, bolding the first column, and logic for a summary row (ensure the summary row is actually added to the final table).");
    } else {
        let feedback = "Your solution is missing some required table elements: ";
        if (!hasKable) feedback += "Use `knitr::kable(head(iris), caption=...)`; ";
        if (!hasKableExtra) feedback += "Use `kableExtra::kable_styling()` to add stripes; ";
        if (!hasBoldColumn) feedback += "Use `column_spec(1, bold = TRUE)` for the first column; ";
        if (!hasSummaryConcept) feedback += "Add logic to calculate and potentially add a summary row (e.g., using `add_row` or `rbind` after calculating means); ";
        displayResult("tables-exercise-result", false, feedback);
    }
}

function checkFiguresExercise() {
    const userCode = document.getElementById("figures-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("figures-exercise-result");
    const hasGgplot = /ggplot\(iris,\s*aes\(.*Sepal\.Length.*Sepal\.Width.*\)\)/i.test(userCode);
    const hasColorBySpecies = /aes\(.*color\s*=\s*Species.*\)/i.test(userCode);
    const hasTitleLabels = /labs\(.*title\s*=/i.test(userCode) && /labs\(.*x\s*=/i.test(userCode) && /labs\(.*y\s*=/i.test(userCode);
    // Check within a chunk header or ggsave
    const hasDimensions = /(fig\.width\s*=\s*8[\s\S]*fig\.height\s*=\s*5|ggsave\(.*width\s*=\s*8.*height\s*=\s*5\))/i.test(userCode);
    const hasCaption = /fig\.cap\s*=\s*["']Iris flower measurements by species["']?/i.test(userCode);

    if (hasGgplot && hasColorBySpecies && hasTitleLabels && hasDimensions && hasCaption) {
        displayResult("figures-exercise-result", true, "Correct! Your code creates a ggplot2 visualization of the iris dataset with all required specifications (mapping, labels, dimensions, caption).");
    } else {
        let feedback = "Your solution is missing some required figure elements: ";
        if (!hasGgplot) feedback += "ggplot() call with iris data, mapping Sepal.Length to x, Sepal.Width to y; ";
        if (!hasColorBySpecies) feedback += "Mapping Species to the color aesthetic; ";
        if (!hasTitleLabels) feedback += "Adding appropriate title and axis labels using `labs()`; ";
        if (!hasDimensions) feedback += "Setting figure dimensions (e.g., `fig.width=8, fig.height=5` in chunk options); ";
        if (!hasCaption) feedback += "Adding the figure caption (e.g., `fig.cap=...` in chunk options); ";
        displayResult("figures-exercise-result", false, feedback);
    }
}

function checkInteractiveExercise() {
    const userCode = document.getElementById("interactive-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("interactive-exercise-result");
    const hasPlotly = /library\(plotly\)/i.test(userCode);
    const hasGgplotly = /ggplotly\(/i.test(userCode);
    const hasDiamonds = /diamonds/i.test(userCode);
    const hasPriceVsCarat = /aes\(.*price.*carat|aes\(.*carat.*price/i.test(userCode);
    // Check for mapping text aesthetic for hover
    const hasHoverInfo = /aes\(.*text\s*=\s*paste|aes\(.*text\s*=\s*str_glue|aes\(.*text\s*=\s*glue/i.test(userCode) && /cut|color|clarity/i.test(userCode);
    const hasColorByCut = /aes\(.*color\s*=\s*cut.*\)/i.test(userCode); // Color might be mapped differently

    if (hasPlotly && hasGgplotly && hasDiamonds && hasPriceVsCarat && hasHoverInfo && hasColorByCut) {
        displayResult("interactive-exercise-result", true, "Correct! Your code uses plotly/ggplotly, plots price vs carat from diamonds, includes hover text with cut/color/clarity, and colors by cut.");
    } else {
        let feedback = "Your solution is missing some required interactive elements: ";
        if (!hasPlotly) feedback += "Load the plotly library; ";
        if (!hasGgplotly) feedback += "Use `ggplotly()` to convert a ggplot; ";
        if (!hasDiamonds) feedback += "Use the diamonds dataset; ";
        if (!hasPriceVsCarat) feedback += "Plot price vs carat; ";
        if (!hasHoverInfo) feedback += "Map details (cut, color, clarity) to the `text` aesthetic for hover info; ";
        if (!hasColorByCut) feedback += "Map `cut` to the color aesthetic; ";
        displayResult("interactive-exercise-result", false, feedback);
    }
}

function checkAdvancedExercise() {
    const userCode = document.getElementById("advanced-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("advanced-exercise-result");
    // Check for indicators of any of the advanced features
    const hasCustomCSS = /(<style>|css:.*\.css|class\s*=)/i.test(userCode);
    const hasMemoryHook = /knit_hooks\$set\([\s\S]*memory|gc\(|object\.size\(|mem_used\(/i.test(userCode);
    const hasMultiLanguage = /```\{r[\s\S]*```[\s\S]*```\{python[\s\S]*```/im.test(userCode);

    if (hasCustomCSS || hasMemoryHook || hasMultiLanguage) {
        let feature = hasCustomCSS ? "custom CSS styling" :
                      hasMemoryHook ? "a memory usage hook/check" :
                      "multi-language R and Python code";
        displayResult("advanced-exercise-result", true, `Looks promising! Your code appears to implement an advanced R Markdown feature using ${feature}. Ensure it functions as intended.`);
    } else {
        displayResult("advanced-exercise-result", false, "Your solution doesn't seem to contain clear indicators of the requested advanced features (custom CSS, memory hook, or multi-language chunks). Please review the examples.");
    }
}

function checkWorkflowExercise() {
    const userCode = document.getElementById("workflow-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("workflow-exercise-result");
    // Check for keywords related to the requirements (less precise)
    const hasFolderStructure = /(data\/|code\/|reports\/|output\/)/i.test(userCode); // Mentions folders
    const hasParameterizedReports = /params:|render\(.*params\s*=/i.test(userCode); // Defines or uses params
    const hasRenderingScript = /render\(|knit\(|build\(|walk\(.*render/i.test(userCode) && /for\s*\(|map\(|walk\(/i.test(userCode); // Render in a loop/map
    const hasDependencyManagement = /renv|packrat|sessionInfo|session_info|library\(|require\(/i.test(userCode); // Mentions tools or loading

    if (hasFolderStructure && hasParameterizedReports && hasRenderingScript && hasDependencyManagement) {
        displayResult("workflow-exercise-result", true, "Good! Your description outlines a workflow including folder structure, parameterized reports, a rendering script, and dependency management considerations.");
    } else {
        let feedback = "Your workflow description seems incomplete: ";
        if (!hasFolderStructure) feedback += "Mention separate folders for data, code, reports; ";
        if (!hasParameterizedReports) feedback += "Describe using parameterized reports (YAML params); ";
        if (!hasRenderingScript) feedback += "Include a script to render multiple reports (e.g., using a loop and `render()`); ";
        if (!hasDependencyManagement) feedback += "Address dependency management (e.g., using `renv` or documenting with `sessionInfo()`); ";
        displayResult("workflow-exercise-result", false, feedback);
    }
}

// From r-quirks.html
function checkAssignmentExercise() {
    const userCode = document.getElementById("assignment-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("assignment-exercise-result");
    if (userCode === "answer <- 42") { // Exact match preferred here
        displayResult("assignment-exercise-result", true, "Correct! You've used the preferred assignment operator `<-`.");
    } else if (userCode.includes("answer") && userCode.includes("<-") && userCode.includes("42")) {
         displayResult("assignment-exercise-result", true, "Correct! You've used the preferred assignment operator `<-`.");
    } else {
        displayResult("assignment-exercise-result", false, "Not quite right. Use `answer <- 42` for assignment in scripts.");
    }
}

function checkDataTypesExercise() {
    const userCode = document.getElementById("data-types-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("data-types-exercise-result");
    if (userCode.includes("data.frame") && userCode.includes("id =") && userCode.includes("name =") && userCode.includes("score =")) {
        displayResult("data-types-exercise-result", true, "Correct! You've created a data frame with the required columns: id, name, and score.");
    } else {
        displayResult("data-types-exercise-result", false, "Not quite right. Make sure to use `data.frame()` and include `id`, `name`, and `score` as columns (e.g., `data.frame(id = ..., name = ..., score = ...)`).");
    }
}

function checkLogicalValuesExercise() {
    const userCode = document.getElementById("logical-values-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("logical-values-exercise-result");
    if (userCode.includes("score > 80") && (userCode.includes("&") || userCode.includes("&&")) && userCode.includes("score < 100")) {
        displayResult("logical-values-exercise-result", true, "Correct! You've checked if the score is between 80 and 100 using comparison and logical AND operators.");
    } else {
        displayResult("logical-values-exercise-result", false, "Not quite right. Make sure to use `score > 80` and `score < 100`, combining them with the AND operator (`&` or `&&`).");
    }
}

// From statistics.html (No specific checkers)

// From tidyverse.html (No specific checkers)

// From visualization.html
function checkGgplotQuiz() {
    const q1Answer = document.querySelector('input[name="ggplot-q1"]:checked');
    const q2Answer = document.querySelector('input[name="ggplot-q2"]:checked');
    const resultDiv = document.getElementById('ggplot-quiz-result');
    if (!resultDiv) return;

    if (!q1Answer || !q2Answer) {
        displayResult('ggplot-quiz-result', false, "Please answer all questions.");
        return;
    }
    const correctQ1 = "b"; // Initialization function
    const correctQ2 = "b"; // Maps variables to visual properties

    if (q1Answer.value === correctQ1 && q2Answer.value === correctQ2) {
        displayResult('ggplot-quiz-result', true, "All correct! `ggplot()` initializes the plot, and `aes()` maps data variables to visual aesthetics.");
    } else {
        let feedback = "Incorrect. ";
        if (q1Answer.value !== correctQ1) feedback += "`ggplot()` is the initialization function. ";
        if (q2Answer.value !== correctQ2) feedback += "`aes()` maps variables to visual properties. ";
        displayResult('ggplot-quiz-result', false, feedback + "Please review the Grammar of Graphics section.");
    }
}

function checkBasicPlotExercise() {
    const userCode = document.getElementById("basic-plot-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("basic-plot-exercise-result");
    // Regex to check for the core components, allowing for variations in spacing
    const correctPattern = /ggplot\s*\(\s*data\s*=\s*iris\s*,\s*aes\s*\(\s*x\s*=\s*Sepal\.Length\s*,\s*y\s*=\s*Petal\.Length\s*,\s*color\s*=\s*Species\s*\)\s*\)\s*\+\s*geom_point\s*\(\s*\)/i;

    if (correctPattern.test(userCode)) {
        displayResult("basic-plot-exercise-result", true, "Correct! This code will create a scatter plot of Sepal.Length vs Petal.Length colored by Species.");
    } else {
        displayResult("basic-plot-exercise-result", false, "Not quite right. The correct answer should map `Sepal.Length` to x, `Petal.Length` to y, and `Species` to color within `aes()`, and add `+ geom_point()`.");
    }
}

// From spatial.html
function checkImportExercise() {
    const userCode = document.getElementById("import-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("import-exercise-result");
    const correctAnswers = ["st_read", "st_read()"]; // Allow with or without ()

    if (correctAnswers.some(answer => userCode.includes(answer))) {
         displayResult("import-exercise-result", true, "Correct! The `st_read()` function is used to import vector spatial data (like shapefiles) in the sf package.");
    } else {
         displayResult("import-exercise-result", false, "Not quite right. The function to read shapefiles with sf is `st_read()`.");
    }
}

function checkCaseStudyExercise() {
    const userCode = document.getElementById("case-study-exercise")?.value.trim() || "";
    const resultDiv = document.getElementById("case-study-exercise-result");
    const hasEconomy = /group_by\s*\(\s*economy\s*\)/i.test(userCode);
    const hasMean = /mean\s*\(\s*gdp_per_capita.*\)/i.test(userCode);
    const hasDescSort = /arrange\s*\(\s*desc\s*\(\s*avg_gdp_per_capita\s*\)\s*\)/i.test(userCode);

    if (hasEconomy && hasMean && hasDescSort) {
        displayResult("case-study-exercise-result", true, "Correct! This code groups by `economy`, calculates the `mean(gdp_per_capita)`, and arranges in descending order.");
    } else {
        let feedback = "Not quite right. ";
        if (!hasEconomy) feedback += "You should `group_by(economy)`. ";
        if (!hasMean) feedback += "Use `summarize()` with `mean(gdp_per_capita)` to calculate the average. ";
        if (!hasDescSort) feedback += "Use `arrange(desc(avg_gdp_per_capita))` to show highest values first. ";
        displayResult("case-study-exercise-result", false, feedback);
    }
}


// --- Event Listener Setup (Optional but Recommended) ---
// Add this at the end of script.js or within a DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    // Add listeners for any buttons that don't have inline onclick
    // Example: document.getElementById('checkFuncBtn_rbasics')?.addEventListener('click', checkFunctionExercise_rbasics);

    // Add listeners for all "Show Solution" links/buttons if using the toggleSolution function
    const solutionToggles = document.querySelectorAll('.check-answer'); // Or specific class/selector
    solutionToggles.forEach(button => {
        const solutionDiv = button.nextElementSibling;
        if (solutionDiv && solutionDiv.classList.contains('solution')) {
            const solutionId = solutionDiv.id || `solution-${Math.random().toString(36).substr(2, 9)}`; // Ensure solution div has an ID
            solutionDiv.id = solutionId; // Assign ID if missing
            button.onclick = () => toggleSolution(solutionId); // Assign the toggle function
            button.style.cursor = 'pointer'; // Make it look clickable
            button.textContent = 'Show Solution'; // Initial text
            solutionDiv.style.display = 'none'; // Ensure initially hidden
        }
    });
});
