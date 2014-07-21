/** @jsx React.DOM */

var ShoppingList = React.createClass({
    getInitialState: function() {
        return { items: [] };
    },
    findKey: function(items, name) {
        return _.findKey(items, function(i) { return i.name.toLowerCase() == name.toLowerCase(); });
    },
    componentDidMount: function() {
        Events.register('input:add', function(ev) {
            this.add(ev.text);
        }.bind(this));

        Events.register('autocomplete:search', function(ev) {
            if (!ev.q) {
                Events.fire('autocomplete:results', { results: [] });
                return;
            }

            var results = _.chain(this.state.items)
                           .where(function(item) {
                               return item.name.toLowerCase().indexOf(ev.q.toLowerCase().substr(0, 1)) > -1;
                           })
                           .map(function(item) {
                               return { name: item.name, d: levDist(item.name.toLowerCase(), ev.q.toLowerCase()) }
                           })
                           .sortBy('d')
                           .take(4)
                           .map(function(item) {
                               return item.name;
                           })
                           .value();
            Events.fire('autocomplete:results', { results: results });
        }.bind(this));

        this.props.firebase.on('value', function(snapshot) {
            // Merge in local state
            var items = snapshot.val() ? snapshot.val() : [];

            var merged = _.mapValues(items, function(serverItem) {
                var key = this.findKey(this.state.items, serverItem.name);

                if (!key) return this.makeServerItem(serverItem);
                return _.extend(_.clone(this.state.items[key]),
                                this.makeServerItem(serverItem));
            }.bind(this));

            this.setState({ items: merged });
        }.bind(this));
    },
    makeServerItem: function(clientItem) {
        // Strip client-side state
        return {
            name: clientItem.name,
            count: clientItem.count
        };
    },
    updateOrAdd: function(clientItem) {
        var serverItem = this.makeServerItem(clientItem);

        var key = this.findKey(this.state.items, clientItem.name);
        if (key) {
            this.props.firebase.child(key).update(serverItem);
            _.extend(this.state.items[key], clientItem);
        }
        else {
            var ref = this.props.firebase.push(serverItem);
            this.state.items[ref.name()] = clientItem;
        }

        this.setState({ items: this.state.items });
    },
    remove: function(name, ev) {
        var key = this.findKey(this.state.items, name);
        if (!key) return;

        var item = this.state.items[key];

        if (!item.just_removed) {
            this.updateOrAdd({
                name: name,
                old_count: item.count,
                just_removed: true,
                count: 0
            });
        } else {
            this.updateOrAdd({
                name: name,
                count: item.old_count,
                just_removed: false
            });
        }

        ev.preventDefault();
        ev.stopPropagation();
    },
    plus: function(name, ev) {
        var key = this.findKey(this.state.items, name);
        if (!key) return;
        var item = this.state.items[key];


        this.updateOrAdd({
            name: name,
            count: item.count + 1
        });

        ev.preventDefault();
        ev.stopPropagation();
    },
    add: function(name) {
        if (!name) return;

        var items = this.state.items;
        var key = this.findKey(items, name);

        if (key) {
            var item = this.state.items[key];
            this.updateOrAdd({
                name: name,
                count: item.count + 1,
                just_removed: false
            })
        }
        else {
            this.updateOrAdd({
                name: name,
                count: 1,
                just_removed: false
            });
        }
    },
    render: function() {
        return <div>{
               _.chain(this.state.items)
                .where(function(item) { return item.count > 0 || item.just_removed; })
                .sortBy(function(item) { return item.name.toLowerCase(); })
                .map(function(item) {
                    return (
                        <div key={ item.name } className="shopping row">
                            <div className="small-10 columns"
                                 style={{ cursor: 'pointer', position: 'relative' }}
                                 onClick={ this.remove.bind(this, item.name) }>
                                { item.just_removed ? <div className="striker" /> : "" }
                                { item.name }
                            </div>
                            <div className="small-1 columns text-center">{ item.count > 1 ? item.count : '' }</div>
                            <div className="small-1 columns text-center"
                                 style={{ cursor: 'pointer' }}
                                 onClick={ this.plus.bind(this, item.name) }>
                                <i className="gen-enclosed fi-plus"></i>
                            </div>
                        </div>);
                }.bind(this))
                .value()
                }</div>;
    }
});
