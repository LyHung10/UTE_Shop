// components/CountdownTimer.jsx
import { useState, useEffect, useRef } from 'react';

const CountdownTimer = ({ startTime, endTime, type = "end", onStatusChange }) => {
    const [timeLeft, setTimeLeft] = useState({ 
        hours: 0, 
        minutes: 0, 
        seconds: 0, 
        ended: false,
        started: false 
    });
    
    const prevStartTimeRef = useRef();
    const prevEndTimeRef = useRef();

    function calculateTimeLeft() {
        const targetTime = type === "start" 
            ? new Date(startTime) 
            : new Date(endTime);
            
        const now = new Date();
        const difference = targetTime.getTime() - now.getTime();
        
        if (difference <= 0) {
            return { 
                hours: 0, 
                minutes: 0, 
                seconds: 0, 
                ended: true,
                started: type === "start" ? true : false
            };
        }

        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            ended: false,
            started: false
        };
    }

    useEffect(() => {
        // Reset timer khi startTime hoặc endTime thay đổi
        if (prevStartTimeRef.current !== startTime || prevEndTimeRef.current !== endTime) {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            
            prevStartTimeRef.current = startTime;
            prevEndTimeRef.current = endTime;
        }

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // Trigger callback khi trạng thái thay đổi
            if (newTimeLeft.ended && !timeLeft.ended) {
                onStatusChange?.(type);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, endTime, type, onStatusChange, timeLeft.ended]);

    // Debug: Log để kiểm tra
    useEffect(() => {
        console.log('Countdown Debug:', {
            type,
            startTime,
            endTime,
            timeLeft,
            now: new Date().toLocaleString('vi-VN')
        });
    }, [timeLeft, type, startTime, endTime]);

    if (timeLeft.ended) {
        return (
            <div className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                {type === "start" ? "Đã bắt đầu" : "Đã kết thúc"}
            </div>
        );
    }

    const bgColor = type === "start" ? "bg-orange-500" : "bg-red-600";
    const label = type === "start" ? "Bắt đầu sau" : "Kết thúc sau";

    return (
        <div className={`flex flex-col items-center ${bgColor} text-white px-3 py-2 rounded text-xs font-bold`}>
            <span className="mb-1">{label}</span>
            <div className="flex items-center gap-1">
                <div className="text-center">
                    <div className="text-sm">{String(timeLeft.hours).padStart(2, '0')}</div>
                </div>
                <span>:</span>
                <div className="text-center">
                    <div className="text-sm">{String(timeLeft.minutes).padStart(2, '0')}</div>
                </div>
                <span>:</span>
                <div className="text-center">
                    <div className="text-sm">{String(timeLeft.seconds).padStart(2, '0')}</div>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;