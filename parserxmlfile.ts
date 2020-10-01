const fs = require('fs') 
const os = require("os");
const streamRead = fs.createReadStream('feedexample.xml');  
const streamWrite = fs.createWriteStream('feed_out.xml'); 
const stream = require('stream'); 
const XmlStream = require('xml-stream') ; // xml to object
const jsonxml = require('jsontoxml');

const today = new Date();
let day_of_the_week : string;
today.getUTCDay() ===  0 ? day_of_the_week = '0' : day_of_the_week = today.getUTCDay().toString();

let current_hour : string;
current_hour = today.getUTCHours()+":"+ today.getUTCMinutes();

const today_hour : number = today.getUTCHours();
const today_minutes : number =  today.getUTCMinutes()
const today_to_parse : string = '01/01/2011 '+ today_hour+':'+today_minutes+':'+'00';
let how_many_active : number = 0;
let how_many_false : number = 0;
let element_to_save;

let xml = new XmlStream(streamRead);
xml.on('endElement: offer', function(item) {
let activity : boolean;
let object_get_date = JSON.parse(item.opening_times);
function returnNewOffer (object) {
      let xml_opening = '01/01/2011 '+object[day_of_the_week][0].opening;
      let xml_closing = '01/01/2011 '+object[day_of_the_week][0].closing;
      if (Date.parse(today_to_parse) > Date.parse(xml_opening) && Date.parse(today_to_parse) < Date.parse(xml_closing)) {
        activity = true;
        how_many_active +=1;
      } else {
        activity = false;
        how_many_false +=1;
      }
      item.is_active = activity;
      
      Object.entries( item ).map( function( entry ) {
        const key = entry[ 0 ];
        const value = entry[ 1 ];
        item[key] = '<![CDATA['+value+']]>';
        });

    return JSON.stringify({offer:item});
}
  element_to_save = jsonxml(returnNewOffer(object_get_date), {
    prettyPrint: true
  })
  streamWrite.write(element_to_save);
})

xml.once('startElement: offer',  function()  {
  streamWrite.write('<?xml version="1.0" encoding="UTF-8" ?>' +os.EOL + '<offers>');
});

xml.on('end', function() { 
  streamWrite.write('</offers>');
  console.log('Offers which are active: ' + how_many_active);
  console.log('Offers which are false: ' + how_many_false);
});