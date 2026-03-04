import { Outlet } from 'react-router-dom';
import { Logo } from './Logo';

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="xray-panel sticky top-0 z-40 rounded-none border-t-0 border-x-0 mx-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                <span className="text-xray-cyan">X-Ray</span> To-do <span className="text-xray-cyan">List</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};
