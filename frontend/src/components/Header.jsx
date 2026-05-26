export default function Header({ title, subtitle }) {
    return (
        <header className="flex items-center justify-between px-8 py-5 border-b border-surface-700/50 bg-surface-900/50 backdrop-blur-sm">
            <div>
                <h2 className="text-lg font-semibold text-surface-100 leading-none">{title}</h2>
                {subtitle && (
                    <p className="text-surface-500 text-sm mt-1">{subtitle}</p>
                )}
            </div>
        </header>
    )
}
