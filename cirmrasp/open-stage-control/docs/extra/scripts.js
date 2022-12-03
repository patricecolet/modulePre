document.addEventListener('DOMContentLoaded', ()=>{

    if (window.location.hash && window.location.href.includes('properties-reference')) {
        // show target in tabs/details
        document.querySelectorAll('[id='+window.location.hash.split("#")[1]+']').forEach(function(item){
            var tab = item.closest('.tabbed-content'),
                details = item.closest('details')
            if (tab) tab.previousSibling.click()
            if (item) {
                item.scrollIntoView()
                document.documentElement.scrollTop -= 70
            }
        })
    }


})
