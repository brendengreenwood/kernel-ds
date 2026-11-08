// co | name | city | state | type | region
// type: r = river terminal, i = interior elevator (rail/truck), p = processing plant, x = export
const raw = `
C|Alberta|Alberta|MN|i|West
C|Albion|Albion|NE|i|Plains
C|Atchison|Cummings|KS|i|Plains
C|Bailey|Selma|NC|i|Southeast
C|Beardsley|Parkston|SD|i|West
C|Beardstown|Beardstown|IL|r|Illinois River
C|Bettendorf|Bettendorf|IA|r|Upper Mississippi
C|Blair corn mill|Blair|NE|p|Plains
C|Bloomingburg|Bloomingburg|OH|i|Eastern Corn Belt
C|Buffalo Island|Charleston|MO|r|Mid-Mississippi
C|Carleton|Carleton|NE|i|Plains
C|Cedar Rapids corn mill|Cedar Rapids|IA|p|Iowa interior
C|Chillicothe|Chillicothe|OH|i|Eastern Corn Belt
C|Cincinnati Kellogg|Cincinnati|OH|r|Ohio River
C|Cincinnati River Road|Cincinnati|OH|r|Ohio River
C|Circleville|Circleville|OH|i|Eastern Corn Belt
C|Dayton corn mill|Dayton|OH|p|Eastern Corn Belt
C|Decatur|Decatur|MI|i|Michigan
C|East St. Louis|East St. Louis|IL|r|Mid-Mississippi
C|Eddyville corn mill|Eddyville|IA|p|Iowa interior
C|Emery|Emery|SD|i|West
C|Florence|Pittsfield|IL|r|Illinois River
C|Forest City|Forest City|MO|i|Plains
C|Fort Dodge corn mill|Fort Dodge|IA|p|Iowa interior
C|Frederick|Beardstown|IL|r|Illinois River
C|Gibbon|Gibbon|NE|i|Plains
C|Gibson City|Gibson City|IL|i|Illinois interior
C|Gilman|Gilman|IL|i|Illinois interior
C|Hales Point|Halls|TN|r|Mid-Mississippi
C|Hammond corn mill|Hammond|IN|p|Eastern Corn Belt
C|Havana|Havana|IL|r|Illinois River
C|Hickman|Hickman|KY|r|Mid-Mississippi
C|Houston (TEMCO)|Houston|TX|x|Gulf
C|Hutchinson East|Hutchinson|KS|i|Plains
C|Hutchinson West|Hutchinson|KS|i|Plains
C|Indianapolis corn mill|Indianapolis|IN|p|Eastern Corn Belt
C|Keithsburg|Keithsburg|IL|r|Upper Mississippi
C|La Crosse|La Crosse|WI|r|Upper Mississippi
C|Lacon|Lacon|IL|r|Illinois River
C|Lima|Lima|OH|i|Eastern Corn Belt
C|Linden|Linden|IN|i|Eastern Corn Belt
C|Madison|Madison|MN|i|West
C|Meredosia|Meredosia|IL|r|Illinois River
C|Milford|Milford|IN|i|Eastern Corn Belt
C|Muscatine|Muscatine|IA|r|Upper Mississippi
C|Napa Junction|Yankton|SD|i|West
C|New Boston|New Boston|IL|r|Upper Mississippi
C|New Madrid|New Madrid|MO|r|Mid-Mississippi
C|O'Neill|O'Neill|NE|i|Plains
C|Ogallah|Ogallah|KS|i|Plains
C|Ord|Ord|NE|i|Plains
C|Paris corn mill|Paris|IL|p|Illinois interior
C|Salina|Salina|KS|i|Plains
C|Savage|Savage|MN|r|Minnesota River
C|Shelton|Shelton|NE|i|Plains
C|Spring Valley South|Granville|IL|r|Illinois River
C|Tipton|Tipton|IN|i|Eastern Corn Belt
C|Topeka Crossroads|Topeka|KS|i|Plains
C|Topeka Gordon|Topeka|KS|i|Plains
C|West Memphis|West Memphis|AR|r|Mid-Mississippi
C|Barber crush|Cleveland|NC|p|Southeast
C|Bloomington crush|Bloomington|IL|p|Illinois interior
C|Cedar Rapids East crush|Cedar Rapids|IA|p|Iowa interior
C|Fayetteville crush|Fayetteville|NC|p|Southeast
C|Gainesville crush|Gainesville|GA|p|Southeast
C|Guntersville crush|Guntersville|AL|p|Southeast
C|Decatur crush|Decatur|AL|p|Southeast
C|Iowa Falls crush|Iowa Falls|IA|p|Iowa interior
C|Kansas City crush|Kansas City|MO|p|Plains
C|Lafayette crush|Lafayette|IN|p|Eastern Corn Belt
C|Owensboro crush|Owensboro|KY|p|Ohio River
C|Sidney crush|Sidney|OH|p|Eastern Corn Belt
C|Sioux City crush|Sioux City|IA|p|Plains
C|Wahpeton corn mill|Wahpeton|ND|p|West
C|West Fargo crush|West Fargo|ND|p|West
C|Wichita crush|Wichita|KS|p|Plains
C|Wakeeney|Wakeeney|KS|i|Plains
C|Harrisonburg feed mill|Harrisonburg|VA|p|Southeast
C|Reserve|Reserve|LA|x|Gulf
C|Westwego|Westwego|LA|x|Gulf
A|Abilene|Abilene|KS|i|Plains
A|Attica|Attica|IN|i|Eastern Corn Belt
A|Beech Grove|Beech Grove|IN|i|Eastern Corn Belt
A|Burlington Gulfport|Gulfport|IL|r|Upper Mississippi
A|Charleston|Charleston|MO|r|Mid-Mississippi
A|Clinton corn plant|Clinton|IA|p|Upper Mississippi
A|Columbus|Columbus|OH|i|Eastern Corn Belt
A|Copeland|Copeland|KS|i|Plains
A|Creve Coeur|Creve Coeur|IL|r|Illinois River
A|Curran|Curran|IL|i|Illinois interior
A|Decatur corn and soy|Decatur|IL|p|Illinois interior
A|Deerfield crush|Deerfield|MO|p|Plains
A|Des Moines crush|Des Moines|IA|p|Iowa interior
A|Dodge City|Dodge City|KS|i|Plains
A|Enid|Enid|OK|i|Plains
A|Enola|Enola|NE|i|Plains
A|Evansville Broadway|Evansville|IN|r|Ohio River
A|Evansville First Ave|Evansville|IN|r|Ohio River
A|Evansville Ohio Street|Evansville|IN|r|Ohio River
A|Evansville River South|Evansville|IN|r|Ohio River
A|Farina|Farina|IL|i|Illinois interior
A|Fostoria crush|Fostoria|OH|p|Eastern Corn Belt
A|Frankfort crush|Frankfort|IN|p|Eastern Corn Belt
A|Fremont crush|Fremont|NE|p|Plains
A|Fremont elevator|Fremont|NE|i|Plains
A|Fullerton|Fullerton|NE|i|Plains
A|Grand Ledge|Grand Ledge|MI|i|Michigan
A|Havana|Havana|IL|r|Illinois River
A|Hebron|Hebron|ND|i|West
A|Helena|Helena|AR|r|Mid-Mississippi
A|Heloise|Heloise|TN|r|Mid-Mississippi
A|Henderson|Henderson|KY|r|Ohio River
A|Hennepin|Hennepin|IL|r|Illinois River
A|Hensler|Hensler|ND|i|West
A|Hoopeston|Hoopeston|IL|i|Illinois interior
A|Hume|Hume|IL|i|Illinois interior
A|Hutchinson|Hutchinson|KS|i|Plains
A|Lacon|Lacon|IL|r|Illinois River
A|Laotto|Laotto|IN|i|Eastern Corn Belt
A|Leoti|Leoti|KS|i|Plains
A|Lincoln elevator|Lincoln|NE|i|Plains
A|Lincoln crush|Lincoln|NE|p|Plains
A|Livingston Point|Livingston Point|KY|r|Ohio River
A|Logansport|Logansport|IN|i|Eastern Corn Belt
A|Macon|Macon|IL|i|Illinois interior
A|Mankato crush|Mankato|MN|p|West
A|Marshall corn plant|Marshall|MN|p|West
A|Marston|Marston|MO|r|Mid-Mississippi
A|Memphis|Memphis|TN|r|Mid-Mississippi
A|Mendota|Mendota|IL|i|Illinois interior
A|Mexico crush|Mexico|MO|p|Plains
A|Montezuma|Montezuma|KS|i|Plains
A|Montpelier|Montpelier|IN|i|Eastern Corn Belt
A|Morris|Morris|IL|r|Illinois River
A|Mound City|Mound City|IL|r|Ohio River
A|Mt. Auburn|Mount Auburn|IL|i|Illinois interior
A|Mt. Vernon|Mount Vernon|IN|r|Ohio River
A|New Haven|New Haven|IN|i|Eastern Corn Belt
A|Newburgh|Newburgh|IN|r|Ohio River
A|Newman Grove|Newman Grove|NE|i|Plains
A|Niantic|Niantic|IL|i|Illinois interior
A|Oakland|Oakland|IL|i|Illinois interior
A|Ottawa Lake|Ottawa Lake|MI|i|Michigan
A|Ottawa DCX|Ottawa|IL|r|Illinois River
A|Ottawa South|Ottawa|IL|r|Illinois River
A|Paducah|Paducah|KY|r|Ohio River
A|Hooker|Hooker|OK|i|Plains
A|Parr|Parr|IN|i|Eastern Corn Belt
A|Patoka|Patoka|IL|i|Illinois interior
A|Plains|Plains|KS|i|Plains
A|Quincy crush|Quincy|IL|p|Upper Mississippi
A|Rockport|Rockport|IN|r|Ohio River
A|Sauget|Sauget|IL|r|Mid-Mississippi
A|Silver Grove|Silver Grove|KY|r|Ohio River
A|Snover|Snover|MI|i|Michigan
A|Spring Valley|Spring Valley|IL|r|Illinois River
A|St. Cloud|Saint Cloud|MN|i|West
A|St. Louis|Saint Louis|MO|r|Mid-Mississippi
A|St. Paul|Saint Paul|MN|r|Minnesota River
A|State Line|Liberal|KS|i|Plains
A|Sullivan|Sullivan|IL|i|Illinois interior
A|Swanington|Swanington|IN|i|Eastern Corn Belt
A|Taylorville|Taylorville|IL|i|Illinois interior
A|Toledo|Toledo|OH|x|Great Lakes
A|Tuscola|Tuscola|IL|i|Illinois interior
A|Valdosta crush|Valdosta|GA|p|Southeast
A|Vidalia|Vidalia|LA|r|Mid-Mississippi
A|Webberville|Webberville|MI|i|Michigan
A|Winona|Winona|MN|r|Upper Mississippi
A|Wisner|Wisner|NE|i|Plains
A|Cedar Rapids corn plant|Cedar Rapids|IA|p|Iowa interior
A|Columbus corn plant|Columbus|NE|p|Plains
A|Enderlin crush|Enderlin|ND|p|West
A|Spiritwood crush|Spiritwood|ND|p|West
A|Velva crush|Velva|ND|p|West
A|Red Wing crush|Red Wing|MN|p|Upper Mississippi
A|Altamont|Altamont|IL|i|Illinois interior
A|Jackson|Jackson|TN|i|Mid-Mississippi
A|Carthage flour mill|Carthage|MO|p|Plains
A|Cleveland flour mill|Cleveland|TN|p|Southeast
A|Ama|Ama|LA|x|Gulf
A|Reserve|Reserve|LA|x|Gulf
A|Destrehan|Destrehan|LA|x|Gulf
`.trim().split("\n").map(l => l.split("|"));


const L = (co, str) => new Set(str.split(",").map(x => co + "|" + x.trim()));
const CORN = new Set([...L("C","Bettendorf,Beardstown,East St. Louis,Florence,Frederick,Gibson City,Gilman,Havana,Keithsburg,Lacon,Meredosia,New Boston,Paris corn mill,Spring Valley South,Hammond corn mill,Indianapolis corn mill,Linden,Milford,Tipton,Cedar Rapids corn mill,Eddyville corn mill,Fort Dodge corn mill,Muscatine,Atchison,Hutchinson East,Hutchinson West,Ogallah,Salina,Topeka Crossroads,Topeka Gordon,Wakeeney,Albion,Blair corn mill,Carleton,Gibbon,O'Neill,Ord,Shelton,Bloomingburg,Chillicothe,Cincinnati Kellogg,Cincinnati River Road,Circleville,Dayton corn mill,Lima,Buffalo Island,Forest City,New Madrid,Alberta,Madison,Savage,Hickman,Owensboro crush,Hales Point,West Memphis,Decatur,Beardsley,Emery,Napa Junction,Wahpeton corn mill,La Crosse,Harrisonburg feed mill"),
 ...L("A","Altamont,Creve Coeur,Curran,Decatur corn and soy,Farina,Burlington Gulfport,Havana,Hennepin,Hoopeston,Hume,Lacon,Macon,Mendota,Morris,Mound City,Mt. Auburn,Niantic,Oakland,Ottawa DCX,Ottawa South,Patoka,Quincy crush,Sauget,Spring Valley,Sullivan,Taylorville,Tuscola,Attica,Beech Grove,Evansville Broadway,Evansville First Ave,Evansville Ohio Street,Evansville River South,Laotto,Logansport,Montpelier,Mt. Vernon,New Haven,Newburgh,Parr,Rockport,Swanington,Cedar Rapids corn plant,Clinton corn plant,Copeland,Hutchinson,Leoti,Montezuma,Plains,Columbus corn plant,Enola,Fremont elevator,Fullerton,Lincoln elevator,Newman Grove,Wisner,Toledo,Charleston,Marston,St. Louis,Marshall corn plant,St. Cloud,St. Paul,Winona,Henderson,Livingston Point,Paducah,Silver Grove,Heloise,Jackson,Memphis,Helena,Grand Ledge,Ottawa Lake,Snover,Webberville,Enid,Hooker,State Line,Vidalia")]);
const SOY = new Set([...L("C","Bettendorf,Alberta,Albion,Atchison,Bailey,Barber crush,Beardsley,Beardstown,Bloomingburg,Bloomington crush,Buffalo Island,Carleton,Cedar Rapids East crush,Chillicothe,Cincinnati Kellogg,Cincinnati River Road,Circleville,Decatur,Decatur crush,East St. Louis,Emery,Fayetteville crush,Florence,Forest City,Frederick,Gainesville crush,Gibbon,Gibson City,Gilman,Guntersville crush,Hales Point,Havana,Hickman,Hutchinson East,Hutchinson West,Iowa Falls crush,Kansas City crush,Keithsburg,Lacon,La Crosse,Lafayette crush,Lima,Linden,Madison,Meredosia,Milford,Muscatine,Napa Junction,New Boston,New Madrid,O'Neill,Ord,Owensboro crush,Salina,Savage,Shelton,Sidney crush,Sioux City crush,Spring Valley South,Tipton,Topeka Crossroads,Topeka Gordon,West Memphis,Wichita crush"),
 ...L("A","Altamont,Creve Coeur,Curran,Decatur corn and soy,Farina,Burlington Gulfport,Havana,Hennepin,Hoopeston,Hume,Lacon,Macon,Mendota,Morris,Mound City,Mt. Auburn,Niantic,Oakland,Ottawa DCX,Ottawa South,Patoka,Quincy crush,Sauget,Spring Valley,Sullivan,Taylorville,Tuscola,Attica,Beech Grove,Evansville Broadway,Evansville First Ave,Evansville Ohio Street,Evansville River South,Frankfort crush,Laotto,Logansport,Montpelier,Mt. Vernon,New Haven,Newburgh,Parr,Rockport,Swanington,Clinton corn plant,Des Moines crush,Copeland,Dodge City,Hutchinson,Leoti,Montezuma,Plains,Enola,Fremont crush,Fremont elevator,Fullerton,Lincoln elevator,Lincoln crush,Newman Grove,Wisner,Columbus,Fostoria crush,Toledo,Charleston,Deerfield crush,Marston,Mexico crush,St. Louis,Mankato crush,Marshall corn plant,St. Cloud,St. Paul,Winona,Henderson,Livingston Point,Paducah,Silver Grove,Heloise,Memphis,Helena,Grand Ledge,Ottawa Lake,Snover,Webberville,Hebron,Hensler,Spiritwood crush,Red Wing crush,Enid,Hooker,State Line,Vidalia,Valdosta crush")]);
const WHEAT = new Set([...L("C","East St. Louis,Gibson City,Milford,Hutchinson East,Hutchinson West,Ogallah,Salina,Topeka Crossroads,Topeka Gordon,Wakeeney,Bloomingburg,Cincinnati Kellogg,Lima,Buffalo Island,New Madrid,Hickman,Owensboro crush,West Memphis,Decatur"),
 ...L("A","Attica,Beech Grove,Evansville Broadway,Evansville First Ave,Evansville Ohio Street,Evansville River South,Logansport,Montpelier,Mt. Vernon,New Haven,Newburgh,Parr,Rockport,Abilene,Copeland,Hutchinson,Leoti,Montezuma,Plains,Lincoln elevator,Columbus,Toledo,Carthage flour mill,Charleston,Marston,St. Louis,Henderson,Livingston Point,Silver Grove,Cleveland flour mill,Heloise,Memphis,Helena,Grand Ledge,Ottawa Lake,Snover,Webberville,Hebron,Hensler,Enid,Hooker,State Line")]);
const MILO = L("C","Hutchinson East,Hutchinson West,Ogallah,Salina,Topeka Crossroads,Topeka Gordon,Wakeeney");
const OTHER = new Set([...L("C","West Fargo crush"),...L("A","Enderlin crush,Velva crush,Webberville")]);
const crops = (co, name, type) => {
  const k = co + "|" + name; let c = "";
  if (CORN.has(k)) c += "c"; if (SOY.has(k)) c += "s"; if (WHEAT.has(k)) c += "w"; if (MILO.has(k)) c += "m"; if (OTHER.has(k)) c += "o";
  if (type === "x") c = "csw";
  return c;
};
const z = require("./zc/package");
// hand-placed: facility names that are not post-office towns
const hand = {
  "Heloise|TN": [36.08, -89.57], "Livingston Point|KY": [37.09, -88.66], "Swanington|IN": [40.60, -87.37],
  "Enola|NE": [41.86, -97.64], "Hensler|ND": [47.18, -101.08], "Halls|TN": [35.95, -89.60],
  "Gulfport|IL": [40.81, -91.09], "Ogallah|KS": [38.99, -99.73], "Parr|IN": [41.03, -87.09],
  "Cummings|KS": [39.46, -95.25], "Mound City|IL": [37.08, -89.16], "East St. Louis|IL": [38.62, -90.15], "O'Neill|NE": [42.46, -98.65], "Curran|IL": [39.74, -89.80], "Sauget|IL": [38.59, -90.17],
};
const out = [], miss = [];
for (const [co, name, city, st, type, region] of raw) {
  let ll = hand[`${city}|${st}`];
  if (!ll) { const r = z.lookupByName(city, st); if (r.length) ll = [+r[0].latitude, +r[0].longitude]; }
  if (!ll) { miss.push(`${city}, ${st}`); continue; }
  out.push([co, name, st, +ll[0].toFixed(3), +ll[1].toFixed(3), type, region, crops(co, name, type)]);
}
console.error("missing:", miss);
console.error("untagged:", out.filter(o=>!o[7]).map(o=>o[0]+" "+o[1]));
console.error("count:", out.length, "C", out.filter(o => o[0] === "C").length, "A", out.filter(o => o[0] === "A").length);
require("fs").writeFileSync("sites.json", JSON.stringify(out));
