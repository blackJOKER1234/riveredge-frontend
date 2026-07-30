interface CompletenessBarProps {
	mapped: number;
	total: number;
}

const CompletenessBar = ({ mapped, total }: CompletenessBarProps) => {
	const completeness = mapped ? (mapped / total) * 100 : 0;

	return (
		<div className="flex items-center gap-2">
			<div className="bg-[#E0E6ECFF] rounded-full w-24 h-2">
				<div
					className={`h-full rounded-full ${
						completeness >= 50
							? "bg-[#389E0DFF]"
							: completeness > 0
								? "bg-[#1890FFFF]"
								: "bg-[#FF5630FF]"
					}`}
					style={{
						width: `${Math.min(completeness, 100)}%`,
					}}
				/>
			</div>
			<span className="text-[#858585FF] text-xs">{`${mapped}/${total}`}</span>
		</div>
	);
};

export default CompletenessBar;
