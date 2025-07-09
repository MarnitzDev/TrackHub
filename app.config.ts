export default defineAppConfig({
    auth: {
        origin: 'https://trackhub.up.railway.app'
    },
    ui: {
        colors: {
            primary: 'blue',
            neutral: 'slate'
        },
        button: {
            slots: {
                base: [
                    'rounded-sm hover:cursor-pointer',
                ]
            }
        }
    }
})