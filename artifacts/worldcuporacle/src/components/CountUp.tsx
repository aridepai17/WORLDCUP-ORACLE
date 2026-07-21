import { useEffect, useState } from "react";
import { animate, useInView, useIsomorphicLayoutEffect } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface CountUpProps {
	value: number;
	decimals?: number;
	duration?: number;
	className?: string;
	suffix?: string;
	prefix?: string;
}

export function CountUp({
	value,
	decimals = 0,
	duration = 1.5,
	className,
	suffix = "",
	prefix = "",
}: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-50px" });

	useEffect(() => {
		if (!isInView || !ref.current) return;

		const controls = animate(0, value, {
			duration,
			ease: "easeOut",
			onUpdate(currentValue) {
				if (ref.current) {
					ref.current.textContent = `${prefix}${currentValue.toFixed(decimals)}${suffix}`;
				}
			},
		});

		return () => controls.stop();
	}, [value, decimals, duration, isInView, prefix, suffix]);

	return (
		<span ref={ref} className={cn("tabular-nums", className)}>
			{prefix}0{suffix}
		</span>
	);
}
