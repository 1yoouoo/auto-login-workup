export const getFeedbackData = async (option: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["username", "password"], (credentials) => {
      const id =
        encryptStr(credentials.username) +
        "_=" +
        encryptStr(credentials.password);
      const feedback = {
        id: id,
        timestamp: new Date().toISOString(),
        option: option,
      };
      resolve(feedback);
    });
  });
};

function encryptStr(s: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const shiftAlphabet = 17;
  const numberReplacements: { [key: string]: string } = {
    "0": "XJshzIQHijuPSDG",
    "1": "LWeadGCayyVIYHK",
    "2": "vLlDcVeqPQMWOIa",
    "3": "HMTTEfjVIDJqVGa",
    "4": "VeqPaCDbvUASHGi",
    "5": "hxjTJVHUSzBWMcc",
    "6": "ASUXJDNSAMPPasq",
    "7": "BlbkFJyzHgVFTla",
    "8": "UobuaFVDSADFAfa",
    "9": "CFVRDIEWKLDRasW",
  };
  const specialCharReplacements: { [key: string]: string } = {
    "@": "esdGCayyaKGlpve",
    "!": "SigcGjT3BlbkFJF",
    ".": "IjasdkwncxkakLO",
    "#": "FJkdsfjiREJfiJI",
    "%": "fJIDfjekfJREfje",
    "^": "JFIsdfjoEJRfjiR",
    "&": "fjIDfjekfJIDfje",
    "*": "KFIJFidjfiJIRJf",
    "(": "ERJfijRJFJFjdfj",
    ")": "JRIEJfjiejfIEJf",
    "-": "NvieIRJfjiREJFj",
    "+": "QlmxKFjiREJRfji",
    "{": "XmcnDVeifJWfjeR",
    "}": "CnvkERjfiRjfIEj",
    "[": "VnmfERJfjiRJfek",
    "]": "BvcmFRJeiCJfkej",
    "|": "LomvEWRijfRJFje",
  };

  let shiftedResult = "";
  for (let i = 0; i < s.length; i++) {
    let char = s[i];
    if (alphabet.includes(char)) {
      let position = alphabet.indexOf(char);
      let newPosition = (position + shiftAlphabet) % 52;
      shiftedResult += alphabet[newPosition];
    } else {
      shiftedResult += char;
    }
  }

  let finalResult = "";
  for (let i = 0; i < shiftedResult.length; i++) {
    let char = shiftedResult[i];
    if (numberReplacements[char] !== undefined) {
      finalResult += numberReplacements[char];
    } else if (specialCharReplacements[char] !== undefined) {
      finalResult += specialCharReplacements[char];
    } else {
      finalResult += char;
    }
  }

  return finalResult;
}
