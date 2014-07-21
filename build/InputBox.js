/** @jsx React.DOM */
var InputBox = React.createClass({displayName: 'InputBox',
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
            React.DOM.form( {onSubmit:this.handleSubmit}, 
                React.DOM.div( {className:"row collapse"}, 
                    React.DOM.div( {className:"medium-10 small-8 columns", style:{ position: 'relative' }}, 
                        React.DOM.input( {key:"input",
                               ref:"inputBox",
                               type:"text",
                               style:{ display: 'block' },
                               value: this.state.text, 
                               onChange:this.handleChange,
                               onFocus:this.handleKeyUp,
                               onKeyUp:this.handleKeyUp,
                               onBlur:this.handleBlur}
                               ),
                        React.DOM.div( {style:{ display : (this.state.autocompletes.length > 0 ? 'block' : 'none'),
                                    height: 'auto',
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    border: 'solid 1px #aaa'
                                    }}, 
                            _.map(this.state.autocompletes, function(auto) {
                                return React.DOM.div( {style:{ display: 'block', padding: '0.4em 0.3em', cursor: 'pointer' },
                                            onClick:this.fireOne.bind(this, auto),
                                            key:auto}, 
                                    auto
                                    )
                            }.bind(this))
                        )
                    ),
                    React.DOM.div( {className:"medium-2 small-4 columns"}, 
                        React.DOM.input( {type:"submit", className:"button postfix", value:"Add"} )
                    )
                )
            ));
    }
});
