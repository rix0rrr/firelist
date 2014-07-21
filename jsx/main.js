/** @jsx React.DOM */
(function() {
    var hash = window.location.hash.replace(/^#/, '');

    if (!hash) {
        alert('Please load this page with the Firebase URL in the hash fragment.');
        return;
    }

    var db = new Firebase(hash);

    React.renderComponent(
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: 0 }}>
            <div style={{ overflow: 'scroll', position: 'absolute', top: 0, bottom: 60, left: 0, right: 0 }}>
                <ShoppingList firebase={db} />
            </div>
            <div style={{ position: 'absolute', bottom: 0, height: 60, left: 0, right: 0 }}>
                <InputBox />
            </div>
        </div>, document.body);
}());
