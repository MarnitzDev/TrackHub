export default defineAppConfig({
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