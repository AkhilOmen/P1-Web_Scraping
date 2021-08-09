let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
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

function Scorecardcb(error, response, html){
    if(error){
        console.log("Error");
    }else if(response.statuscode == 404){
        console.log("Page Not Found");
    }else{
        Batsmandata(html);
    }
}

let MainPath = process.cwd();

let IPLDirPath = path.join(MainPath, "IPL");
fs.mkdirSync(IPLDirPath);

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

        let TeamFilePath = path.join(IPLDir, MyteamName);
        fs.mkdirSync(TeamFilePath);
        
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


            content = content + MyteamName + Name + Venue + OpponentTeamName + Result1 + Balls + Runs + Fours + Sixes + Sr + "\n";
            
            let filePath = path.join(TeamFilePath, Name);
            fs.writeFileSync(filePath, content);

            // console.log(MyteamName, Name, Venue, OpponentTeamName, Runs, Balls, Fours, Sixes, Sr, Result1);

        }

    }

}
