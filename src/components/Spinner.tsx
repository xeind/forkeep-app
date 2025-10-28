import './Spinner.css';

const bars = Array(12).fill(0);

interface SpinnerProps {
  color?: string;
  size?: number;
}

export default function Spinner({ color = 'white', size = 16 }: SpinnerProps) {
  return (
    <div
      className="spinner-wrapper"
      style={
        {
          '--spinner-size': `${size}px`,
          '--spinner-color': color,
        } as React.CSSProperties
      }
    >
      <div className="spinner">
        {bars.map((_, i) => (
          <div className="spinner-bar" key={`spinner-bar-${i}`} />
        ))}
      </div>
    </div>
  );
}
