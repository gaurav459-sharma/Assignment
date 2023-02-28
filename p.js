var CryptoJS = require("crypto-js");

//convert the hexadecimal value to decimal.
const hexToDec = (hex) => {
    hex = hex.toUpperCase();  //convert all the character to upper case like in hexadecimmal(e,E) are consider same
    const char1 = hex[1]
    const char2 = hex[0]
    let dec = 0

    let i = char1.charCodeAt(0)  // it gives the ascii of corresponding character
    dec += ((i >= 65) ? i - 55 : i - 48)
    i = char2.charCodeAt(0)
    dec += 16 * ((i >= 65) ? i - 55 : i - 48)
    return dec;
}

//This function convert the TLV format of decryption into the Json format
const tlvToJson = (msg) => {
    //Here we escape two character of msg because these are tag contain '80',or '81','82'
    const firstLength = hexToDec(msg.substr(2, 2))  //After the tag we have length of corresponding tag

    //In res1, res2, res3 we store the user data like name, dob, country
    var res1 = '';
    for (let i = 0; i < firstLength; i++) {
        let ascii = hexToDec(msg.substr(4 + i * 2, 2)) //here we pass hexadecimal value to convert into decimal value
        res1 += String.fromCharCode(ascii) // It convert the ascii decimal value into character
    }
    //Similarly we do this for other two tags as we have total 3 tags(80, 81,82)
    const secondLength = hexToDec(msg.substr(firstLength * 2 + 6, 2))
    var res2 = '';
    for (let i = 0; i < secondLength; i++) {
        let ascii = hexToDec(msg.substr(firstLength * 2 + 8 + i * 2, 2))
        res2 += String.fromCharCode(ascii)
    }
    var res3 = '';
    const thirdLength = hexToDec(msg.substr(firstLength * 2 + secondLength * 2 + 10, 2))
    for (let i = 0; i < thirdLength; i++) {
        let ascii = hexToDec(msg.substr(firstLength * 2 + secondLength * 2 + 12 + i * 2, 2))
        res3 += String.fromCharCode(ascii)
    }
    //Here we make object to store the answer
    var detail = {
        Name: '',
        DOB: '',
        Country: ''
    }
    detail.Name = msg.substr(0, 2) == '80' ? res1 : (msg.substr(4 + firstLength * 2, 2) == '80' ? res2 : res3);
    detail.DOB = msg.substr(0, 2) == '81' ? res1 : (msg.substr(4 + firstLength * 2, 2) == '81' ? res2 : res3);
    detail.Country = msg.substr(0, 2) == '82' ? res1 : (msg.substr(4 + firstLength * 2, 2) == '82' ? res2 : res3);
    return detail
}

//This is the main function where we have 1 million user encrypted data in code and Aes key
const convertToJson = (code, key) => {
    for (let i = 0; i < code.length; i++) { //traverse the complte array of encrypted data
        var bytes = CryptoJS.AES.decrypt(ciphertext, key);  //decryption of encrypted data in TLV format
        var originalText = bytes.toString(CryptoJS.enc.Utf8);  //convert the above decrypt data in string

        console.log(tlvToJson(originalText.substr(4)))  //passing to this function to convert into the Json format
    }
}

//Here I assuming the data before encrption is converted into TLV format(Table, length and value) like given below
const code = ["A11E800E44656e6e697320526974636869658108303930393139343182025553", "A11E800E44656e6e697320526974636869658108303930393139343182025553"]
key='123'
for(let i=0;i<code.length;i++){
    var ciphertext = CryptoJS.AES.encrypt(code[i], key).toString(); 
}

convertToJson(code,key) // here we the pass 1 million user encypted data with Aes key
