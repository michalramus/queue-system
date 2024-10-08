export default function Card({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: React.ComponentProps<'div'>['className'];
}) {
    return (
        <div
            className={`block rounded-lg bg-secondary-1 p-6 shadow ${className}`}
        >
            {children}
        </div>
    );
}
