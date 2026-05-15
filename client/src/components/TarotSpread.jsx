import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { tarotData } from '../data/tarotData';
import './TarotSpread.css';

const TarotCardItem = React.memo(({ index, isSelected, selectOrder, totalCards, onClick }) => {
  const midIndex = (totalCards - 1) / 2;

  // 💡 [수정] 78장의 원들이 겹치며 아름답고 자연스러운 고전 타로 매장의 아치를 그리도록 분산도 조율
  const anglePerCard = 0.52;
  const rotate = (index - midIndex) * anglePerCard;

  // 크기가 복원된 카드가 균일한 간격을 가지며 펼쳐지도록 수평 폭 보정
  const translateX = (index - midIndex) * 11.2;
  // 양 날개가 바닥으로 내려갈 때 짤림 각도가 발생하지 않도록 부드러운 하강 포물선 방정식 대입
  const translateY = Math.pow(index - midIndex, 2) * 0.046;

  const baseTransform = `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`;

  return (
    <div
      onClick={() => onClick(index)}
      className={`tarot-card ${isSelected ? 'selected' : ''}`}
      style={{
        '--current-transform': baseTransform,
        transform: baseTransform,
        zIndex: index
      }}
    >
      <div className="card-back">
        {isSelected ? <span className="order-badge">{selectOrder}번</span> : '✨'}
      </div>
    </div>
  );
});

TarotCardItem.displayName = 'TarotCardItem';

export default function TarotSpread() {
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const initGame = () => {
    const deck = [...tarotData];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setShuffledDeck(deck);
    setSelectedIndices([]);
    setShowResult(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = useCallback((index) => {
    if (showResult) return;

    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev;
      if (prev.length >= 3) return prev;

      const nextSelected = [...prev, index];
      if (nextSelected.length === 3) {
        setTimeout(() => setShowResult(true), 500);
      }
      return nextSelected;
    });
  }, [showResult]);

  const selectedCards = useMemo(() => {
    if (selectedIndices.length < 3 || shuffledDeck.length === 0) return [];
    return selectedIndices.map((deckIndex) => shuffledDeck[deckIndex]);
  }, [selectedIndices, shuffledDeck]);

  const combinedReading = useMemo(() => {
    if (selectedCards.length < 3 || !selectedCards) return null;

    const [pastCard, presentCard, futureCard] = selectedCards;
    const majorCount = selectedCards.filter(c => c && c.type === 'major').length;

    let destinyTone = "";
    if (majorCount >= 2) {
      destinyTone = "현재 마주한 고민은 인생의 중요한 흐름 속에 놓여 있습니다. 외부 환경의 변화를 차분히 관조해야 할 때입니다.";
    } else {
      destinyTone = "일상적인 선택과 주변 환경의 에너지가 모여 변화를 만드는 시기입니다. 당신의 주도적인 대처가 결과를 좌우할 것입니다.";
    }

    return {
      summary: `${pastCard.keyword || ""}의 경험을 거쳐 ${presentCard.keyword || ""}의 국면을 마주한 당신은, 조만간 ${futureCard.keyword || ""}의 흐름으로 나아가게 됩니다.`,
      narrative: `과거에는 [${pastCard.name || ""}]의 영향으로 ${pastCard.meaningShort || ""} 단계를 분주히 거쳐왔습니다. 그 축적된 흐름은 현재 [${presentCard.name || ""}]로 이어져 ${presentCard.meaningShort || ""} 국면을 자아내고 있습니다. 마지막으로 마주할 핵심 열쇠는 [${futureCard.name || ""}]입니다. 이 카드는 다가올 흐름이 ${futureCard.meaningShort || ""} 방향으로 전환될 것임을 명확히 시사합니다.`,
      advice: `🌟 통합 조언: ${destinyTone} 과거의 원인에 얽매이기보다는 현재 찾아온 신호를 담담히 기회로 삼으세요.`
    };
  }, [selectedCards]);

  return (
    <div className="tarot-container">
      <h2>🔮 통합 3카드 스프레드 타로</h2>
      <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '13px' }}>마음을 가다듬고 78장의 카드 중 과거, 현재, 미래가 될 카드 3장을 골라주세요.</p>
      <p style={{ color: '#00f2fe', fontSize: '12px', marginTop: '-10px', marginBottom: '20px' }}>※ 화면 크기에 맞추어 78장 전체 덱 레이아웃 배율이 최적화됩니다.</p>
      <button className="shuffle-btn" onClick={initGame}>다시 셔플하기</button>

      {showResult && combinedReading && (
        <div className="combined-result-box">
          <h3 className="result-main-title">✨ 당신의 종합 타로 리딩 리포트 ✨</h3>

          <div className="mini-card-display">
            {selectedCards.map((card, idx) => {
              const timelineLabels = ["과거", "현재", "미래"];
              if (!card) return null;
              return (
                <div key={idx} className="mini-card-item">
                  <span className="timeline-badge">{timelineLabels[idx]}</span>
                  <div className="mini-image-frame">
                    <img src={card.imageUrl} alt={card.name} loading="lazy" />
                  </div>
                  <span className="mini-card-name">{card.name}</span>
                </div>
              );
            })}
          </div>

          <div className="reading-text-area">
            <div className="reading-section summary-zone">
              <strong>🎯 운명의 요약:</strong>
              <p>{combinedReading.summary}</p>
            </div>

            <div className="reading-section narrative-zone">
              <strong>📖 종합 스토리 리딩:</strong>
              <p>{combinedReading.narrative}</p>
            </div>

            <div className="reading-section advice-zone">
              <p>{combinedReading.advice}</p>
            </div>
          </div>
        </div>
      )}

      <div className="deck-wrapper">
        <div className="fan-deck">
          {shuffledDeck.map((card, index) => {
            const isSelected = selectedIndices.includes(index);
            const selectOrder = selectedIndices.indexOf(index) + 1;

            return (
              <TarotCardItem
                key={card.id}
                index={index}
                isSelected={isSelected}
                selectOrder={selectOrder}
                totalCards={shuffledDeck.length}
                onClick={handleCardClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
