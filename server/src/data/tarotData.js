// 라이더 웨이트 일러스트 이미지 원본 저장소 CDN URL
const IMAGE_BASE_URL = "githubusercontent.com";

const majorNames = [
  "The Fool (광대)", "The Magician (마법사)", "The High Priestess (여사제)", "The Empress (여황제)",
  "The Emperor (황제)", "The Hierophant (교황)", "The Lovers (연인)", "The Chariot (전차)",
  "Strength (힘)", "The Hermit (은둔자)", "Wheel of Fortune (운명의 수레바퀴)", "Justice (정의)",
  "The Hanged Man (매달린 사람)", "Death (죽음)", "Temperance (절제)", "The Devil (악마)",
  "The Tower (탑)", "The Star (별)", "The Moon (달)", "The Sun (태양)",
  "Judgement (심판)", "The World (세계)"
];

const suits = [
  { code: "w", name: "Wands (완드 / 지팡이)" },
  { code: "c", name: "Cups (컵)" },
  { code: "s", name: "Swords (검)" },
  { code: "p", name: "Pentacles (펜타클 / 동전)" }
];

const courtCards = ["Page", "Knight", "Queen", "King"];
const generatedTarotData = [];

// [Step A] 메이저 아르카나 22장 매핑 (m00.jpg ~ m21.jpg)
majorNames.forEach((name, index) => {
  const fileNumber = String(index).padStart(2, '0');
  generatedTarotData.push({
    id: index,
    name: name,
    type: "major",
    meaningUp: `${name} 카드의 정방향 흐름입니다. 새로운 운명의 에너지와 긍정적인 신호에 집중해 보세요.`,
    imageUrl: `${IMAGE_BASE_URL}/m${fileNumber}.jpg`
  });
});

// [Step B] 마이너 아르카나 56장 매핑 (w01~14, c01~14, s01~14, p01~14)
let currentId = 22;
suits.forEach((suit) => {
  // 숫자 카드 1(Ace) ~ 10번 생성
  for (let i = 1; i <= 10; i++) {
    const cardTitle = i === 1 ? `Ace of ${suit.name}` : `${i} of ${suit.name}`;
    const fileNumber = String(i).padStart(2, '0');
    generatedTarotData.push({
      id: currentId++,
      name: cardTitle,
      type: "minor",
      meaningUp: `${cardTitle} 정방향: 해당 원소가 원초적으로 상징하는 긍정적 기운과 일상의 변화를 암시합니다.`,
      imageUrl: `${IMAGE_BASE_URL}/${suit.code}${fileNumber}.jpg`
    });
  }

  // 인물 궁정 카드 4장 생성 (Page, Knight, Queen, King)
  courtCards.forEach((court, idx) => {
    const cardTitle = `${court} of ${suit.name}`;
    const fileNumber = String(11 + idx);
    generatedTarotData.push({
      id: currentId++,
      name: cardTitle,
      type: "minor",
      meaningUp: `${cardTitle} 정방향: 인물이 내포하고 있는 행동력, 지혜, 혹은 주변 환경의 조언을 의미합니다.`,
      imageUrl: `${IMAGE_BASE_URL}/${suit.code}${fileNumber}.jpg`
    });
  });
});

export const tarotData = generatedTarotData;
