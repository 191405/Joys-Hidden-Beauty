export const formatTime = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
