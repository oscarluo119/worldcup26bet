import ar from "../assets/flags/ar.svg";
import at from "../assets/flags/at.svg";
import au from "../assets/flags/au.svg";
import ba from "../assets/flags/ba.svg";
import be from "../assets/flags/be.svg";
import br from "../assets/flags/br.svg";
import ca from "../assets/flags/ca.svg";
import cd from "../assets/flags/cd.svg";
import ch from "../assets/flags/ch.svg";
import ci from "../assets/flags/ci.svg";
import co from "../assets/flags/co.svg";
import cv from "../assets/flags/cv.svg";
import cw from "../assets/flags/cw.svg";
import cz from "../assets/flags/cz.svg";
import de from "../assets/flags/de.svg";
import dz from "../assets/flags/dz.svg";
import ec from "../assets/flags/ec.svg";
import eg from "../assets/flags/eg.svg";
import es from "../assets/flags/es.svg";
import fr from "../assets/flags/fr.svg";
import gbEng from "../assets/flags/gb-eng.svg";
import gbSct from "../assets/flags/gb-sct.svg";
import gh from "../assets/flags/gh.svg";
import hr from "../assets/flags/hr.svg";
import ht from "../assets/flags/ht.svg";
import iq from "../assets/flags/iq.svg";
import ir from "../assets/flags/ir.svg";
import jo from "../assets/flags/jo.svg";
import jp from "../assets/flags/jp.svg";
import kr from "../assets/flags/kr.svg";
import ma from "../assets/flags/ma.svg";
import mx from "../assets/flags/mx.svg";
import nl from "../assets/flags/nl.svg";
import no from "../assets/flags/no.svg";
import nz from "../assets/flags/nz.svg";
import pa from "../assets/flags/pa.svg";
import pt from "../assets/flags/pt.svg";
import py from "../assets/flags/py.svg";
import qa from "../assets/flags/qa.svg";
import sa from "../assets/flags/sa.svg";
import se from "../assets/flags/se.svg";
import sn from "../assets/flags/sn.svg";
import tn from "../assets/flags/tn.svg";
import tr from "../assets/flags/tr.svg";
import us from "../assets/flags/us.svg";
import uy from "../assets/flags/uy.svg";
import uz from "../assets/flags/uz.svg";
import za from "../assets/flags/za.svg";

const FLAG_ASSETS = {
  ar,
  at,
  au,
  ba,
  be,
  br,
  ca,
  cd,
  ch,
  ci,
  co,
  cv,
  cw,
  cz,
  de,
  dz,
  ec,
  eg,
  es,
  fr,
  "gb-eng": gbEng,
  "gb-sct": gbSct,
  gh,
  hr,
  ht,
  iq,
  ir,
  jo,
  jp,
  kr,
  ma,
  mx,
  nl,
  no,
  nz,
  pa,
  pt,
  py,
  qa,
  sa,
  se,
  sn,
  tn,
  tr,
  us,
  uy,
  uz,
  za,
};

const TEAM_NAME_TO_CODE = {
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  "Bosnia and Herzegovina": "ba",
  Brazil: "br",
  Canada: "ca",
  Colombia: "co",
  Croatia: "hr",
  Curacao: "cw",
  Czechia: "cz",
  "Czech Republic": "cz",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Haiti: "ht",
  Iran: "ir",
  Iraq: "iq",
  "Ivory Coast": "ci",
  Japan: "jp",
  Jordan: "jo",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "New Zealand": "nz",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Portugal: "pt",
  Qatar: "qa",
  "DR Congo": "cd",
  Scotland: "gb-sct",
  Senegal: "sn",
  "Saudi Arabia": "sa",
  "South Africa": "za",
  SouthKorea: "kr",
  Korea: "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Tunisia: "tn",
  Turkey: "tr",
  Uruguay: "uy",
  USA: "us",
  "United States": "us",
  Uzbekistan: "uz",
  "Cape Verde": "cv",
  "法国": "fr",
  "西班牙": "es",
  "阿根廷": "ar",
  "英格兰": "gb-eng",
  "葡萄牙": "pt",
  "巴西": "br",
  "荷兰": "nl",
  "摩洛哥": "ma",
  "比利时": "be",
  "德国": "de",
  "克罗地亚": "hr",
  "哥伦比亚": "co",
  "塞内加尔": "sn",
  "墨西哥": "mx",
  "美国": "us",
  "南非": "za",
  "韩国": "kr",
  "捷克": "cz",
  "加拿大": "ca",
  "波黑": "ba",
  "巴拉圭": "py",
  "卡塔尔": "qa",
  "瑞士": "ch",
  "海地": "ht",
  "苏格兰": "gb-sct",
  "澳大利亚": "au",
  "土耳其": "tr",
  "库拉索": "cw",
  "日本": "jp",
  "科特迪瓦": "ci",
  "厄瓜多尔": "ec",
  "瑞典": "se",
  "突尼斯": "tn",
  "沙特阿拉伯": "sa",
  "乌拉圭": "uy",
  "佛得角": "cv",
  "伊朗": "ir",
  "新西兰": "nz",
  "埃及": "eg",
  "伊拉克": "iq",
  "挪威": "no",
  "阿尔及利亚": "dz",
  "奥地利": "at",
  "约旦": "jo",
  "加纳": "gh",
  "巴拿马": "pa",
  "刚果民主共和国": "cd",
  "乌兹别克斯坦": "uz",
};

function normalizeName(name) {
  return String(name || "").trim();
}

export function getFlagAssetByCountryCode(countryCode) {
  return FLAG_ASSETS[String(countryCode || "").trim().toLowerCase()] || "";
}

export function getFlagAssetByTeamName(name) {
  const normalized = normalizeName(name);
  const code = TEAM_NAME_TO_CODE[normalized] || "";
  return code ? getFlagAssetByCountryCode(code) : "";
}

export function getFlagRenderData({ teamName = "", countryCode = "", fallbackEmoji = "", alt = "" } = {}) {
  const src = getFlagAssetByCountryCode(countryCode) || getFlagAssetByTeamName(teamName);
  const resolvedAlt = alt || normalizeName(teamName) || String(countryCode || "").trim() || "flag";
  if (src) return { type: "image", src, alt: resolvedAlt };
  if (fallbackEmoji) return { type: "emoji", emoji: fallbackEmoji, alt: resolvedAlt };
  return { type: "fallback", alt: resolvedAlt };
}
