document.getElementById('run').addEventListener('click', async () => {
    let code = document.getElementById('code').value;
    let outputElement = document.getElementById('output');
    outputElement.textContent = "Running...";

    try {
        const pyodide = await loadPyodide();

        // Load selected modules, but only if they are not standard libraries
        const nonStandardModules = ['numpy', 'pandas', 'scipy', 'matplotlib', 'seaborn', 'scikit-learn', 'statsmodels', 'requests'];
        for (let module of selectedModules) {
            if (nonStandardModules.includes(module)) {
                await pyodide.loadPackage(module);
            }
        }

        let wrappedCode = `
import sys
from io import StringIO

original_stdout = sys.stdout
sys.stdout = StringIO()

try:
    exec("""${code}""")
    result = sys.stdout.getvalue()
except Exception as e:
    result = str(e)

sys.stdout = original_stdout
result
        `;

        let output = await pyodide.runPythonAsync(wrappedCode);
        messageCallback(output === null || output === undefined ? "No result" : output.toString());
    } catch (err) {
        console.error(err);
        outputElement.textContent = err.toString();
    }
});

function messageCallback(message) {
    document.getElementById('output').textContent = message;
}

document.getElementById('copy').addEventListener('click', () => {
    let code = document.getElementById('code').value;
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

document.getElementById('toggleTheme').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// Modal handling
let modal = document.getElementById('moduleModal');
let btn = document.getElementById('modules');
let span = document.getElementsByClassName('close')[0];
let selectedModules = [];

btn.onclick = function () {
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById('loadModule').addEventListener('click', () => {
    let checkboxes = document.querySelectorAll('#moduleModal input[type="checkbox"]:checked');
    selectedModules = [];
    checkboxes.forEach((checkbox) => {
        selectedModules.push(checkbox.value);
    });
    alert(`Modules loaded: ${selectedModules.join(', ')}`);
    modal.style.display = "none";
});
