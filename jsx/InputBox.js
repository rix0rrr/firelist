/** @jsx React.DOM */
var InputBox = React.createClass({
    getInitialState: function() {
        return { text: '', autocompletes: [] };
    },
    componentDidMount: function() {
        Events.register('autocomplete:results', function(ev) {
            this.setState({ autocompletes: ev.results });
        }.bind(this));
    },
    handleSubmit: function(ev) {
        Events.fire('input:add', { text: this.state.text });
        this.setState({ text: '', autocompletes: [] });

        ev.preventDefault();
        ev.stopPropagation();
    },
    handleChange: function(ev) {
        this.setState({ text: ev.target.value });
    },
    fireOne: function(text, ev) {
        Events.fire('input:add', { text: text });
        this.setState({ text: '', autocompletes: [] });

        ev.preventDefault();
        ev.stopPropagation();
    },
    handleKeyUp: function(ev) {
        Events.fire('autocomplete:search', { q: ev.target.value });
    },
    handleBlur: function(ev) {
        window.setTimeout(function() {
            this.setState({ autocompletes: [] })
        }.bind(this), 100);
    },
    render: function() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="row collapse">
                    <div className="small-10 columns" style={{ position: 'relative' }}>
                        <input key="input"
                               ref="inputBox"
                               type="text"
                               style={{ display: 'block' }}
                               value={ this.state.text }
                               onChange={this.handleChange}
                               onFocus={this.handleKeyUp}
                               onKeyUp={this.handleKeyUp}
                               onBlur={this.handleBlur}
                               />
                        <div style={{ display : (this.state.autocompletes.length > 0 ? 'block' : 'none'),
                                    height: 'auto',
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    border: 'solid 1px #aaa'
                                    }}>
                            {_.map(this.state.autocompletes, function(auto) {
                                return <div style={{ display: 'block', padding: '0.4em 0.3em', cursor: 'pointer' }}
                                            onClick={this.fireOne.bind(this, auto)}
                                            key={auto}>
                                    {auto}
                                    </div>
                            }.bind(this))}
                        </div>
                    </div>
                    <div className="small-2 columns">
                        <input type="submit" className="button postfix" value="Add" />
                    </div>
                </div>
            </form>);
    }
});
