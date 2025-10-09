import readline from 'readline';

/**
 * Secure password input with masking (asterisks)
 * Falls back to visible input if TTY is not available
 * @param {string} prompt - The prompt to display
 * @returns {Promise<string>} - The entered password
 */
export async function securePasswordInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let password = '';
    let isMuted = false;

    // Check if we can mute (TTY available and raw mode supported)
    const canMute = process.stdin.isTTY && typeof process.stdin.setRawMode === 'function';

    if (canMute) {
      // Enable raw mode for character-by-character input
      process.stdin.setRawMode(true);
      process.stdout.write(prompt);

      process.stdin.on('data', (char) => {
        const charStr = char.toString('utf8');

        switch (charStr) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            process.stdin.setRawMode(false);
            process.stdout.write('\n');
            rl.close();
            resolve(password);
            break;

          case '\u0003': // Ctrl+C
            process.stdin.setRawMode(false);
            process.stdout.write('\n');
            rl.close();
            process.exit(0);
            break;

          case '\u007f': // Backspace
          case '\b': // Backspace on some systems
            if (password.length > 0) {
              password = password.slice(0, -1);
              // Move cursor back, write space, move back again
              process.stdout.write('\b \b');
            }
            break;

          default:
            // Only accept printable characters
            if (charStr >= ' ' && charStr <= '~') {
              password += charStr;
              process.stdout.write('*');
            }
            break;
        }
      });
    } else {
      // Fallback to visible input
      console.warn('⚠️  Terminal does not support hidden input. Password will be visible.');
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

/**
 * Simple password input without masking (visible)
 * Used as fallback
 * @param {string} prompt - The prompt to display
 * @returns {Promise<string>} - The entered password
 */
export async function simplePasswordInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Ask a yes/no question
 * @param {string} prompt - The question to ask
 * @returns {Promise<boolean>} - true for yes, false for no
 */
export async function confirmPrompt(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${prompt} (y/n): `, (answer) => {
      rl.close();
      const response = answer.toLowerCase().trim();
      resolve(response === 'y' || response === 'yes');
    });
  });
}

export default securePasswordInput;