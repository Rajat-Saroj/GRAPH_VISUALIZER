const { exec } = require('child_process');
const path = require('path');

const runPythonScript = (scriptName, data) => {
  return new Promise((resolve, reject) => {
    console.log('=== PYTHON SCRIPT DEBUG START ===');
    console.log('Script name:', scriptName);
    console.log('Input data:', JSON.stringify(data, null, 2));
    
    const scriptPath = path.join(__dirname, '../algorithms/', scriptName);
    console.log('Full script path:', scriptPath);
    
    // ✅ Fixed: Use backticks and properly escape quotes
    const command = `python "${scriptPath}" "${JSON.stringify(data).replace(/"/g, '\\"')}"`;
    console.log('Command:', command);
    
    exec(command, { shell: true }, (error, stdout, stderr) => {
      console.log('=== PYTHON EXECUTION COMPLETE ===');
      console.log('Stdout:', stdout);
      console.log('Stderr:', stderr);
      
      if (error) {
        console.error('Execution error:', error);
        reject(error);
      } else {
        if (!stdout.trim()) {
          reject(new Error('No output from Python script'));
          return;
        }
        
        try {
          const parsedResult = JSON.parse(stdout.trim());
          console.log('Successfully parsed result:', parsedResult);
          resolve(parsedResult);
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError);
          console.error('Raw stdout was:', stdout);
          reject(new Error(`JSON parsing failed: ${parseError.message}`));
        }
      }
    });
  });
};

module.exports = runPythonScript;
