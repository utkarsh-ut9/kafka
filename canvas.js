const cvs = require('canvas')
const { createCanvas } = cvs

const ttp = (text, color1 = `white`, color2 = null, strokeColor = `black`) => new Promise((resolve, reject) => {
    try {
        text = text.replace(/\s/g, '\n')
        const canvas = createCanvas(512, 512)
        const ctx = canvas.getContext('2d')
        let textData = text.split('\n')

        // Combine short words
        let s = 0
        do {
            s = textData.findIndex(n => {
                if (n.length < 5)
                    return n
            })
            let isFront = false
            if (s > 0 && s != textData.length - 1 && s != -1) {
                isFront = textData[s - 1].length < textData[s + 1] ? true : false
            }
            if (s > 0 && s != textData.length - 1 && isFront && s != -1) {
                const merged = `${textData[s - 1]} ${textData[s]}`
                textData.splice(s - 1, 2, merged)
            } else if (s != textData.length - 1 && !isFront && s != -1) {
                const merged = `${textData[s]} ${textData[s + 1]}`
                textData.splice(s, 2, merged)
            } else if (s == textData.length - 1) {
                s = -1
            }
        } while (s != -1)

        // Split long words
        let p = -1
        do {
            p = textData.findIndex(n => {
                if (n.length > 15)
                    return n
            })
            if (p != -1) {
                const splitWords = textData[p].match(/.{1,14}/g)
                textData.splice(p, 1, splitWords[0], splitWords[1])
            }
        } while (p != -1)

        let posY = 256
        let longest = textData.reduce((a, b) => {
            return a.length > b.length ? a : b
        })
        let inputText = ctx.measureText(longest)
        let fontSize = 170 - inputText.width - (textData.length * 5)
        const lineHeight = inputText.emHeightAscent + fontSize
        posY = posY - (textData.length - 1) * lineHeight / 2
        ctx.font = `${fontSize}px Comic Sans MS`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        if (color2) {
            var gradient = ctx.createLinearGradient(0, 0, 500, 0)
            gradient.addColorStop(0, color1)
            gradient.addColorStop(1, color2)
            ctx.fillStyle = gradient
        } else {
            ctx.fillStyle = color1
        }
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 8
        textData.forEach((data, i) => {
            ctx.strokeText(data, 256, posY + (i * lineHeight), 500)
            ctx.fillText(data, 256, posY + (i * lineHeight), 500)
        })

        resolve(canvas.toBuffer())
    } catch (err) {
        reject(err)
    }
})


module.exports = {
    ttp: function() {
      // Your ttp function implementation
    },
    // Other functions or objects
  };