
export class VMTLoader {
    protected dir :string = "icons/"
    constructor(){

    }
    
    async getBaseTexture(filename: string): Promise<string>{
        try {
            const response = await fetch(`${this.dir}leaderboard_class_${filename}.vmt`);
            if (response.ok) {
                const fileContent: string = await response.text();
                const lines = fileContent.split("\n");
                let basetexturename:string;
                for(let l of lines){
                    if(l.includes("$baseTexture")){
                        basetexturename = l.split(" ")[1];
                        //console.log("base texture full name: ",basetexturename);
                        let regex = /(leaderboard_class_)\w+/g;
                        const info = basetexturename.match(regex)[0].substring(18);
                        //console.log("Icon vmt opened: ",info);
                        return info
                    }
                }
                
            } else {
                console.error('Failed to open file:', response.status, response.statusText);
                return filename
            }
        } catch (error) {
            console.error('Error:', error);
            return filename
        }
    }

}