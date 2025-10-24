import { motion } from 'framer-motion';

function Tonearm({ isPlaying, onTogglePlay }) {
  // 톤암 회전 각도 (재생 시 레코드 위로, 정지 시 밖으로)
  const tonearmRotation = isPlaying ? -25 : 0;

  return (
    <motion.div
      className="tonearm-fixed"
      onClick={onTogglePlay}
      animate={{
        rotate: tonearmRotation,
      }}
      transition={{
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96], // 부드러운 easing
      }}
      style={{
        transformOrigin: 'right center',
        cursor: 'pointer',
      }}
    >
      {/* 톤암 베이스 */}
      <div className="tonearm-base"></div>

      {/* 톤암 암 */}
      <div className="tonearm-arm">
        <div className="tonearm-body"></div>

        {/* 톤암 헤드 */}
        <div className="tonearm-head">
          <div className="tonearm-cartridge"></div>
          <div className="tonearm-needle"></div>
        </div>
      </div>

      {/* 카운터웨이트 */}
      <div className="tonearm-counterweight"></div>

      {/* 호버 힌트 */}
      {!isPlaying && (
        <div className="tonearm-hint">
          Click to play
        </div>
      )}
    </motion.div>
  );
}

export default Tonearm;
