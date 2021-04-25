import { readFile } from "./utils";

readFile('./test.txt').then((res: string[]) => {
    console.log(res)
})