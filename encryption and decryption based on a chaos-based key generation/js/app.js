// Select elements from the DOM using the querySelector method
const $ = document.querySelector.bind(document);

// Constants defining maximum iterations and initial value for chaos-based key generation
const MAX_ITERATION = 200;
const X0 = new Decimal("0.880000000000000");

// Variable to track the iteration count
let iteration = -1;

// Function to generate the key map using the Newton-Raphson iteration
let generateKeyMap = (xi, fx, f1x, keyMap = []) => {
  // Calculate values for chaos-based key generation
  let _fx = xi ? xi.pow(2).times(8).minus(xi).add(1) : 0;
  let _f1x = xi ? xi.times(16).minus(1) : 0;
  let _xi = xi ? xi.minus(_fx.dividedBy(_f1x)) : X0;

  // Check if the maximum iteration count is reached
  if (++iteration > MAX_ITERATION) return keyMap;

  // Perform key map generation recursively
  if (iteration === 0) {
    return generateKeyMap(_xi);
  } else {
    // Process the generated key map into rows and columns
    let keyRow = [];
    let indexOfDot = _xi.toString().indexOf(".");
    let xiFixed15 = _xi.toFixed(15);
    let item = xiFixed15.substring(indexOfDot + 1, xiFixed15.length).split("");

    // Divide the key map into rows of 3 characters
    for (let i = 0; i < 15; i += 3) {
      let keyStr = "";
      for (let j = 0; j < 3; ++j) keyStr += item[i + j];
      keyRow.push(keyStr);
    }

    // Recursively generate the key map
    return generateKeyMap(_xi, _fx, _f1x, [...keyMap, keyRow]);
  }
};

// Generate the chaos-based key map
const KEY_MAP = generateKeyMap();

// Select elements related to encryption and decryption from the DOM
const ENCRYPT_PLAINTEXT_INPUT = $("#encrypt-plaintext-input");
const ENCRYPT_KEY_INPUT = $("#encrypt-key-input");
const ENCRYPT_SUBMIT_BUTTON = $("#encrypt-submit-button");
const DECRYPT_CIPHERTEXT_INPUT = $("#decrypt-ciphertext-input");
const DECRYPT_KEY_INPUT = $("#decrypt-key-input");
const DECRYPT_SUBMIT_BUTTON = $("#decrypt-submit-button");
const OUTPUT_WRAPPER = $("#output-wrapper");

// Function to toggle the output display
let toggleOutput = (text, outputWrapper) => {
  outputWrapper.classList.remove("active");
  
  setTimeout(() => {
    outputWrapper.innerHTML = `<span id="output-text">${text}</span>`;
    outputWrapper.classList.add("active");
  }, 500);
};

// Function to perform encryption or decryption based on user input
let crypto = (type, data) => {
  let pi, ci, ki, ascii;
  let output = "";

  // Switch statement to determine encryption or decryption
  switch (type) {
    case "ENCRYPT":
      // Encryption process
      for (let i = 0; i < data.text.length; ++i) {
        pi = data.text.charCodeAt(i);
        ki = +KEY_MAP[i % KEY_MAP.length][+data.key - 1] % 256;
        ascii = (pi + ki) % 256;
        output += ascii.toString(16).padStart(2, "0");
      }
      break;
    case "DECRYPT":
      // Decryption process
      let asciiArr = [];
      for (let i = 0; i < data.text.length; i += 2) {
        asciiArr.push(String.fromCharCode(parseInt(data.text.substr(i, 2), 16)));
      }
      for (let i = 0; i < asciiArr.length; ++i) {
        ci = asciiArr[i].charCodeAt(0);
        ki = +KEY_MAP[i % KEY_MAP.length][+data.key - 1] % 256;
        ascii = (ci < ki ? (ci + 256 - ki) : (ci - ki)) % 256;
        output += String.fromCharCode(ascii);
      }
      break;
  }

  // Toggle output display
  toggleOutput(output, OUTPUT_WRAPPER);
};

// Event listener for encryption button click
ENCRYPT_SUBMIT_BUTTON.addEventListener("click", () => {
  // Validate the encryption key value
  if (+ENCRYPT_KEY_INPUT.value < 1 || +ENCRYPT_KEY_INPUT.value > 5) return;
  // Perform encryption
  crypto("ENCRYPT", { text: ENCRYPT_PLAINTEXT_INPUT.value, key: ENCRYPT_KEY_INPUT.value });
});

// Event listener for decryption button click
DECRYPT_SUBMIT_BUTTON.addEventListener("click", () => {
  // Validate the decryption key value
  if (+DECRYPT_KEY_INPUT.value < 1 || +DECRYPT_KEY_INPUT.value > 5) return;
  // Perform decryption
  crypto("DECRYPT", { text: DECRYPT_CIPHERTEXT_INPUT.value, key: DECRYPT_KEY_INPUT.value });
});
