let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let xlsx = require("xlsx");
const { SIGABRT } = require("constants");


let URL = "https://www.espncricinfo.com/series/ipl-2020-21-1210595"

console.log("Main Page is called");
request(URL, cb1)

function cb1(error, response, html){
    if(error){
        console.log("Error");
    }else if(response.statuscode == 404){
        console.log("Page Not Found");
    }else{
        dataExtraction(html);
    }
}

function dataExtraction(html){
    
    let searchTool = cheerio.load(html);
    
    let AllMatchAnchor = searchTool(".widget-items a");
    let AllMatchslink = AllMatchAnchor.attr("href");
    let allMatchPagelink = `https://www.espncricinfo.com${AllMatchslink}`;

    request(allMatchPagelink, allMatchscb);

}

function allMatchscb(error, response, html){
    if(error){
        console.log("Error");
    }else if(response.statuscode == 404){
        console.log("Page Not Found");
    }else{
        allScoreCardData(html);
    }
}

function allScoreCardData(html){
    
    let searchTool = cheerio.load(html);

    let ScorecardArr = searchTool("a[data-hover='Scorecard']");

    for( let i = 0; i < ScorecardArr.length; i++){

        let Scorecard = searchTool(ScorecardArr[i]).attr("href");
        let Scorecardlink = `https://www.espncricinfo.com${Scorecard}`;

        request(Scorecardlink, Scorecardcb);

    }
        
}

let MainPath = process.cwd();

let IPLDirPath = path.join(MainPath, "IPL");
fs.mkdirSync(IPLDirPath);

function Scorecardcb(error, response, html){
    if(error){
        console.log("Error");
    }else if(response.statuscode == 404){
        console.log("Page Not Found");
    }else{
        Batsmandata(html);
    }
}

function Batsmandata(html){

    let searchTool = cheerio.load(html);

    let BatsmanTableArr = searchTool(".table.batsman tbody");


    for(let j = 0; j < BatsmanTableArr.length; j++){

        let BatsmanTable = searchTool(BatsmanTableArr[j]).find("tr");
        let VenueDetails = searchTool(".table-responsive table tbody tr");
        let VenueDetails1 = searchTool(VenueDetails[0]).find("td");
        let Team = searchTool(".match-info.match-info-MATCH.match-info-MATCH-half-width>.teams a .name");
        let Results = searchTool(".match-info.match-info-MATCH.match-info-MATCH-half-width>div.status-text");

        if( j == 0){
            MyteamName = searchTool(Team[0]).text();
            OpponentTeamName = searchTool(Team[1]).text();
        }else if( j == 1 ){
            MyteamName = searchTool(Team[1]).text();
            OpponentTeamName = searchTool(Team[0]).text();
        }

        let content = ""

        for(let i = 0; i < (BatsmanTable.length - 1)/2; i++){

            let BatsmanDetails = searchTool(BatsmanTable[i*2]).find("td");

            Name = searchTool(BatsmanDetails[0]).text();
            Venue = searchTool(VenueDetails1).text();
            Result1 = searchTool(Results[0]).text();
            Balls = searchTool(BatsmanDetails[3]).text();
            Runs = searchTool(BatsmanDetails[2]).text();
            Fours = searchTool(BatsmanDetails[5]).text();
            Sixes = searchTool(BatsmanDetails[6]).text();
            Sr = searchTool(BatsmanDetails[7]).text();   
            
            // console.log(MyteamName, Name, Venue, OpponentTeamName, Runs, Balls, Fours, Sixes, Sr, Result1);

            processPlayer(MyteamName, Name, Venue, OpponentTeamName, Runs, Balls, Fours, Sixes, Sr, Result1);

        }

    }

}

function processPlayer(MyteamName, Name, Venue, OpponentTeamName, Runs, Balls, Fours, Sixes, Sr, Result1){

    let Obj = {
        MyteamName, 
        Name, 
        Venue, 
        OpponentTeamName, 
        Runs, 
        Balls, 
        Fours, 
        Sixes, 
        Sr, 
        Result1
    }

    let TeamPath = path.join(IPLDirPath, MyteamName);

    if(fs.existsSync(TeamPath) == false){
        fs.mkdirSync(TeamPath);
    }

    let PlayerFilePath = path.join(TeamPath, Name+".xlsx");
    let PlayerArr = [];

    if(fs.existsSync(PlayerFilePath) == false){
        PlayerArr.push(Obj);
    }else{
        // PlayerArr = getContent(PlayerFilePath);
        PlayerArr = excelReader(PlayerFilePath, Name)
        PlayerArr.push(Obj);
    }

    // writeContent(PlayerFilePath, PlayerArr);
    excelWriter(PlayerFilePath, PlayerArr, Name)

}

// function getContent(PlayerFilePath){
//     let content = fs.readFileSync(PlayerFilePath);
//     return JSON.parse(content);
// }

// function writeContent(PlayerFilePath, content){
//     let JsonData = JSON.stringify(content);
//     fs.writeFileSync(PlayerFilePath, JsonData);
// }

function excelReader(filePath, sheetName) {
    // player workbook
    let wb = xlsx.readFile(filePath);
    // get data from a particular sheet in that wb
    let excelData = wb.Sheets[sheetName];
    // sheet to json 
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

function excelWriter(filePath, json, sheetName) {
    // workbook create
    let newWB = xlsx.utils.book_new();
    // worksheet
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    // excel file create 
    xlsx.writeFile(newWB, filePath);
}


