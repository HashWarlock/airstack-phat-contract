import { useCallback, useEffect, useState } from "react";
import { CommonInputProps, InputBase, IntegerVariant, isValidInteger } from "~~/components/scaffold-eth";

type UInt8InputProps = CommonInputProps<string | bigint> & {
    variant?: IntegerVariant;
};

export const UInt8Input = ({
                                 value,
                                 onChange,
                                 name,
                                 placeholder,
                                 disabled,
                                 variant = IntegerVariant.UINT8,
                             }: UInt8InputProps) => {
    const [inputError, setInputError] = useState(false);
    const addByOne = useCallback(() => {
        if (typeof value === "bigint") {
            return onChange(value + 1n);
        }
        return onChange(BigInt(Math.round(Number(value) + 1)));
    }, [onChange, value]);

    useEffect(() => {
        if (isValidInteger(variant, value, false)) {
            setInputError(false);
        } else {
            setInputError(true);
        }
    }, [value, variant]);

    return (
        <InputBase
            name={name}
            value={value}
            placeholder={placeholder}
            error={inputError}
            onChange={onChange}
            disabled={disabled}
            suffix={
                !inputError && (
                    <div
                        className="space-x-4 flex tooltip tooltip-top tooltip-secondary before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
                        data-tip="Add by 1"
                    >
                        <button
                            className={`${disabled ? "cursor-not-allowed" : "cursor-pointer"} font-semibold px-4 text-accent`}
                            onClick={addByOne}
                            disabled={disabled}
                        >
                            +
                        </button>
                    </div>
                )
            }
        />
    );
};
