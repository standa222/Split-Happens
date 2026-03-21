import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {generateRoutes} from "./utils/routeUtils";
import { navigations } from "./config/routes";
import {ProtectedRoute} from "./components/ProtectedRoute";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {LoginPage} from "./pages/LoginPage/LoginPage";
import {Page404} from "./pages/Page404";
import {AppLayout} from "./components/AppLayout";
import {ThemeProvider} from "@mui/material";
import { theme } from "./theme/theme";
import {IntlProvider} from "react-intl";
import { messages } from "./locales";
import { useLocaleStore } from "./store/localeStore";

const queryClient = new QueryClient();

export function App() {
    const locale = useLocaleStore((s) => s.locale);

    return (
        <IntlProvider locale={locale} messages={messages[locale]}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <Router>
                        <Routes>
                            {/* Public Route */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Authenticated Wrapper */}
                            <Route element={<AppLayout />}>
                                <Route element={<ProtectedRoute />}>
                                    {generateRoutes(navigations)}
                                    {/* 404 */}
                                    <Route path="*" element={<Page404 />} />
                                </Route>
                            </Route>
                        </Routes>
                    </Router>
                    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
                </QueryClientProvider>
            </ThemeProvider>
        </IntlProvider>
    );
}