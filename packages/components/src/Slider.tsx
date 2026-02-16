import { Slider as AntSlider } from 'antd';

interface SliderProps {
    readonly value: number;
    readonly min: number;
    readonly max: number;
    readonly step?: number;
    readonly disabled?: boolean;
    readonly onChange: (value: number) => void;
}

export const Slider = ({ value, min, max, step = 1, disabled = false, onChange }: SliderProps) => {
    const handleChange = (newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            onChange(newValue);
        }
    };

    return (
        <AntSlider
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={handleChange}
        />
    );
};
