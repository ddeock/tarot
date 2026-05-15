// 💡 [최종 수정] 외부 GitHub 통신 차단을 차단하고 100% 확실하게 구동하는 로컬 public 주소 매핑
const LOCAL_IMAGE_PATH = "/cards";

const majorNames = [
  { name: "The Fool (광대)", kw: "자유로운 출발", ms: "계획 없는 순수한 열정의" },
  { name: "The Magician (마법사)", kw: "능력의 발현", ms: "준비된 재능을 꺼내어 주도권을 잡는" },
  { name: "The High Priestess (여사제)", kw: "직관적 통찰", ms: "내면의 목소리와 지혜에 귀를 기울이는" },
  { name: "The Empress (여황제)", kw: "풍요와 결실", ms: "안정감 속에서 무언가를 결실 맺는" },
  { name: "The Emperor (황제)", kw: "권위와 책임", ms: "영역을 구축하고 강한 책임감을 짊어지는" },
  { name: "The Hierophant (교황)", kw: "중재와 조언", ms: "전통을 따르고 멘토의 도움을 받는" },
  { name: "The Lovers (연인)", kw: "선택과 조화", ms: "관계 속에서 마음이 이끄는 결정을 내리는" },
  { name: "The Chariot (전차)", kw: "돌진과 승리", ms: "장애물을 뚫고 목표를 향해 질주하는" },
  { name: "Strength (힘)", kw: "인내와 포용", ms: "내면의 부드러운 통찰과 인내로 상황을 다스리는" },
  { name: "The Hermit (은둔자)", kw: "자아 성찰", ms: "소음에서 벗어나 깊이 있게 답을 탐구하는" },
  { name: "Wheel of Fortune (운명의 수레바퀴)", kw: "피할 수 없는 변화", ms: "개인의 통제를 벗어난 타이밍을 맞이하는" },
  { name: "Justice (정의)", kw: "균형과 결단", ms: "이성적인 저울질을 통해 공정한 결론을 내는" },
  { name: "The Hanged Man (매달린 사람)", kw: "과도기와 기다림", ms: "행동이 묶인 채 다른 시각으로 타이밍을 기다리는" },
  { name: "Death (죽음)", kw: "종결과 재탄생", ms: "미련을 끝마치고 새로운 판을 짜야만 하는" },
  { name: "Temperance (절제)", kw: "조화와 소통", ms: "서로 다른 요소를 조율하며 중용을 지켜나가는" },
  { name: "The Devil (악마)", kw: "집착과 구속", ms: "순간의 유혹이나 끊어내지 못하는 관계에 얽매이는" },
  { name: "The Tower (탑)", kw: "갑작스러운 붕괴", ms: "기존의 기반이 예기치 못한 충격으로 허물어지는" },
  { name: "The Star (별)", kw: "희망과 비전", ms: "어둠 속에서 길잡이를 발견하고 꿈을 꾸기 시작하는" },
  { name: "The Moon (달)", kw: "불안과 모호함", ms: "앞이 보이지 않아 막연한 두려움 속에 서성거리게 되는" },
  { name: "The Sun (태양)", kw: "명확한 성공", ms: "모든 의문이 해소되고 에너지가 가득 차오르는" },
  { name: "Judgement (심판)", kw: "부활과 보상", ms: "지나간 노력에 대한 정당한 메아리를 듣는" },
  { name: "The World (세계)", kw: "완성과 통합", ms: "긴 여정이 종착지에 도달하여 마무리를 짓는" }
];

const suits = [
  { code: "w", name: "Wands (완드)" },
  { code: "c", name: "Cups (컵)" },
  { code: "s", name: "Swords (검)" },
  { code: "p", name: "Pentacles (펜타클)" }
];

const courtCards = ["Page", "Knight", "Queen", "King"];
const generatedTarotData = [];

// [Step A] 메이저 아르카나 22장 생성 (로컬 /cards/m00.jpg 매핑)
majorNames.forEach((item, index) => {
  const fileNumber = String(index).padStart(2, '0');
  generatedTarotData.push({
    id: index,
    name: item.name,
    type: "major",
    keyword: item.kw,
    meaningShort: item.ms,
    imageUrl: `${LOCAL_IMAGE_PATH}/m${fileNumber}.jpg`
  });
});

// [Step B] 마이너 아르카나 56장 생성 (로컬 /cards/w01.jpg 매핑)
let currentId = 22;
suits.forEach((suit) => {
  for (let i = 1; i <= 10; i++) {
    const cardTitle = i === 1 ? `Ace of ${suit.name}` : `${i} of ${suit.name}`;
    const fileNumber = String(i).padStart(2, '0');
    generatedTarotData.push({
      id: currentId++,
      name: cardTitle,
      type: "minor",
      keyword: `${suit.name} ${i}번의 흐름`,
      meaningShort: `${suit.name} 원소 기반의 현실적인 행동을 조율하는`,
      imageUrl: `${LOCAL_IMAGE_PATH}/${suit.code}${fileNumber}.jpg`
    });
  }

  courtCards.forEach((court, idx) => {
    const cardTitle = `${court} of ${suit.name}`;
    const fileNumber = String(11 + idx);
    generatedTarotData.push({
      id: currentId++,
      name: cardTitle,
      type: "minor",
      keyword: `${cardTitle}의 성향`,
      meaningShort: `${cardTitle} 인물이 뜻하는 조언과 외부 소식을 반영하는`,
      imageUrl: `${LOCAL_IMAGE_PATH}/${suit.code}${fileNumber}.jpg`
    });
  });
});

export const tarotData = generatedTarotData;
