export default {
    onMessage: null,

    init() {
        //
    },

    sendMessage(payload) {
        const tokenTag = document.head.querySelector('meta[name="csrf-token"]')

        if (! tokenTag) {
            throw new Error('Whoops, looks like you haven\'t added a "csrf-token" meta tag');
        }

        const token = tokenTag.content

        fetch('/livewire/message', {
            method: 'POST',
            body: JSON.stringify(payload),
            // This enables "cookies".
            credentials: "same-origin",
            headers: {
                'X-CSRF-TOKEN': token,
                'Content-Type': 'application/json',
                'Accept': 'text/html, application/xhtml+xml',
            },
        }).then(response => {
            if (response.ok) {
                response.text().then(response => {
                    this.onMessage.call(this, JSON.parse(response))
                })
            } else {
                response.text().then(response => {
                    this.showHtmlModal(response)
                })
            }
        })
    },

    // This code and concept is all Jonathan Reinink - thanks main!
    showHtmlModal(html) {
        let page = document.createElement('html')
        page.innerHTML = html
        page.querySelectorAll('a').forEach(a => a.setAttribute('target', '_top'))

        let modal = document.createElement('div')
        modal.id = 'burst-error'
        modal.style.position = 'fixed'
        modal.style.width = '100vw'
        modal.style.height = '100vh'
        modal.style.padding = '50px'
        modal.style.backgroundColor = 'rgba(0, 0, 0, .6)'
        modal.style.zIndex = 200000

        let iframe = document.createElement('iframe')
        iframe.style.backgroundColor = 'white'
        iframe.style.borderRadius = '5px'
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        modal.appendChild(iframe)

        document.body.prepend(modal)
        document.body.style.overflow = 'hidden'
        iframe.contentWindow.document.open()
        iframe.contentWindow.document.write(page.outerHTML)
        iframe.contentWindow.document.close()

        // Close on click.
        modal.addEventListener('click', () => this.hideHtmlModal(modal))

        // Close on escape key press.
        modal.setAttribute('tabindex', 0)
        modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hideHtmlModal(modal) })
        modal.focus()
    },

    hideHtmlModal(modal) {
        modal.outerHTML = ''
        document.body.style.overflow = 'visible'
    }
}
