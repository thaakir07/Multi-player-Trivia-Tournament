import "./Timer.css";

interface TimerProps {
    timeRemaining: number;
}

function Timer({timeRemaining}: TimerProps) {
    const getTimerClass = () => {
        if (timeRemaining > 10) return 'timer-green';
        if (timeRemaining > 5) return 'timer-orange';
        return 'timer-red';
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`timer ${getTimerClass()}`}>
          <span className="timer-value">
                {timeRemaining > 0 ? formatTime(timeRemaining) : "Time's Up!"}
            </span>
        </div>
    )
}

export default Timer;