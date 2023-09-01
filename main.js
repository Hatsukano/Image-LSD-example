const Jimp = require('jimp');

// 要隐藏的文本信息
const secretMessage = "这是一个秘密信息。This is a secret message.";
// 将文本信息编码成UTF-8字节
const encodedMessage = Buffer.from(secretMessage, 'utf-8');
// 要操作的图片路径
const imagePath = './input.png';
const outputImagePath = './output.png';
// 将文本信息隐藏在图片中
async function hideTextInImage() {
  try {
    const image = await Jimp.read(imagePath);
    // 遍历字节，将每个字节的比特位嵌入到图片的LSB
    let pixelIndex = 0;
    for (let i = 0; i < encodedMessage.length; i++) {
      for (let bitIndex = 7; bitIndex >= 0; bitIndex--) {
        const bit = (encodedMessage[i] >> bitIndex) & 1;
        const pixel = image.bitmap.data[pixelIndex];

        // 将最低有效位替换为当前比特位
        const modifiedPixel = (pixel & 0xfe) | bit;
        image.bitmap.data[pixelIndex] = modifiedPixel;
        
        pixelIndex++;
      }
    }

    // 保存嵌入了文本信息的新图片
    await image.write(outputImagePath);
    console.log('信息已成功隐藏在图片中。');
  } catch (error) {
    console.error('出现错误：', error);
  }
}

// 从隐藏的图片中提取文本信息
async function extractTextFromImage() {
    try {
      const encodedImage = await Jimp.read(outputImagePath);
      let extractedMessage = '';
      
      let currentByte = 0;
      let bitCount = 0;
  
      for (let pixelIndex = 0; pixelIndex < encodedImage.bitmap.data.length; pixelIndex++) {
        const pixel = encodedImage.bitmap.data[pixelIndex];
        const bit = pixel & 1;
        currentByte = (currentByte << 1) | bit;
        bitCount++;
  
        if (bitCount === 8) {
          if (currentByte === 0) {
            break; // 遇到结束标志，停止提取
          }
          extractedMessage += String.fromCharCode(currentByte);
          currentByte = 0;
          bitCount = 0;
        }
      }
  
      const decodedMessage = Buffer.from(extractedMessage, 'binary').toString('utf-8');
      console.log('从图片中提取的信息：', decodedMessage);
    } catch (error) {
      console.error('出现错误：', error);
    }
}

async function main(){
    // 调用函数进行操作
    await hideTextInImage();
    await extractTextFromImage();
}

main();
