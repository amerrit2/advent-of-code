import { image } from './input.json';
import _ from 'lodash';

enum PixelColor {
    Black = "0",
    White = "1",
    Transparent = "2",
}

class Layer {
    public rows: string[][] = [];
    constructor(public rowLength: number, public rowHeight: number) {};
    addPixel(pixel: string): boolean {
        const rowCount = this.rows.length;
        const lastRow = _.last(this.rows);

        if (!lastRow) {
            // First pixel in layer
            const newRow = [pixel];
            this.rows.push(newRow);
            return true;
        } else if (lastRow.length === this.rowLength) {
            if (rowCount === this.rowHeight) {
                return false;
            }

            const newRow = [pixel];
            this.rows.push(newRow);
            return true;
        }

        lastRow.push(pixel);
        return true;
    }

    setPixel(row: number, col: number, pixel: string) {
        if (row >= this.rows.length) {
            this.rows[row] = [];
        }

        this.rows[row][col] = pixel;
    }

    countPixels(matcher: string) {
        let num = 0;
        for (const row of this.rows) {
            for (const pixel of row) {
                if (pixel === matcher) {
                    num++;
                }
            }
        }
        return num;
    }

    getPixel(row: number, column: number) {
        if (row >= this.rows.length) {
            throw new Error(`Row out of bounds - row:${row} , layerHeight:${this.rows.length}`);
        }
        
        if (column >= this.rows[row].length) {
            throw new Error(`Column out of bounds - column:${column} , layerWidth:${this.rows[row].length}`);
        }
        
        return this.rows[row][column];
    }
    
    print() {
        for (const row of this.rows) {
            console.log(row.map(pixel => {
                // return pixel;
                if (pixel === PixelColor.Transparent) {
                    throw new Error("Attempt to print with transparent pixels");
                }

                return pixel === PixelColor.Black ? "༖" : " "
            }).join(""));
        }
    }

}

function buildLayers(rowLength: number, rowCount: number, image: string[]): Layer[] {
    const layers: Layer[] = [];

    let nextPixel: string | undefined = image.shift();

    while (nextPixel !== undefined) {
        const lastLayer = _.last(layers);
        if (!lastLayer) {
            // Fist layer
            const newLayer = new Layer(rowLength, rowCount);
            newLayer.addPixel(nextPixel);
            layers.push(newLayer);
        } else {
            if (!lastLayer.addPixel(nextPixel)) {
                const newLayer = new Layer(rowLength, rowCount);
                newLayer.addPixel(nextPixel);
                layers.push(newLayer);
            }            
        }

        nextPixel = image.shift();
    }

    return layers;
}

// const layers = buildLayers(3,2, ["1","2","3","4","5","6","7","8","9","0","1","2"]);
const layers = buildLayers(25, 6, image.split(""));
// const layers = buildLayers(2, 2, "0222112222120000".split(""));

// layers.forEach((layer, idx) => {
//     console.log(`Layer ${idx + 1}: ${layer.rows.length} x ${layer.rows[0].length}`);
// });


let fewestZeroes = Infinity;
let fewestZeroLayer: Layer | null = null;

for (const layer of layers) {
    const numZeroes = layer.countPixels("0");
    if (numZeroes < fewestZeroes) {
        fewestZeroes = numZeroes;
        fewestZeroLayer = layer;
    }
}

console.log(fewestZeroLayer);
if (fewestZeroLayer) {
    console.log("Is valid 1703 ===", fewestZeroLayer.countPixels("1") * fewestZeroLayer.countPixels("2"));
}


function getOutputValue(row: number, col: number, layers: Layer[]) {
    for (const layer of layers) {
        const pixel = layer.getPixel(row, col);
        if (pixel !== PixelColor.Transparent) {
            return pixel;
        }
    }

    throw new Error(`Failed to find value for ${row},${col}`);
}

function getOutputLayer(encodedImage: string, rowCount: number, colCount: number): Layer {
    const layers = buildLayers(colCount, rowCount, encodedImage.split(""));


    const outputLayer = new Layer(colCount, rowCount);
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            outputLayer.setPixel(r, c, getOutputValue(r, c, layers));
        }
    }

    return outputLayer;
}

const testDecodedImage = getOutputLayer("0222112222120000", 2, 2);
const decodedImage = getOutputLayer(image, 6, 25);
//testDecodedImage.print();
decodedImage.print();



