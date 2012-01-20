(function($) {
    
    // Comments
    var Comment = Backbone.Model.extend({
        initialize: function() {
            this.set({date_submitted : new Date().getTime()})
        }
    });
    
    var CommentCollection = Backbone.Collection.extend({
        model: Comment
    });
    
    // Questions
    var Question = Backbone.Model.extend({
        initialize: function() {
            this.set({
                date_submitted : new Date().getTime(),
                votes: 0
            });
        },
        addComment: function(comment){
            var cc = this.get('comments');
            return cc.add(comment);
        },
        getComments: function() {
            return this.get('comments');
        },
        incrementVotes: function() {
            var currentVotes = this.get('votes');
            currentVotes++;
            this.set({votes: currentVotes});
            return currentVotes;
        }
    });
    
    var QuestionCollection = Backbone.Collection.extend({
        model: Question
    });
    
    var CommentView = Backbone.View.extend({
        tagName: 'div',
        className: 'answer',
        
        initialize: function() {
            _.bindAll(this, 'render');
            this.render();
        },
        
        render: function() {
            $(this.el).html(this.model.get('body'));
            return this;
        }
    });
    
    var QuestionView = Backbone.View.extend({
        tagName: 'div',
        className: 'question',
        template: _.template($('#question-template').text()),
        
        events: {
            'click .question-meta-like': 'addLike',
            'click .question-description h2': 'toggleComments',
            'submit .question-form' : 'addComment'
        },
        
        initialize: function() {
            _.bindAll(this, 'addLike', 'toggleComments', 'appendComment', 'render', 'addComment');
            
            this.hasVoted = false;
            this.comments = new CommentCollection();
            this.comments.bind('add', this.appendComment);
            
            this.render();
        },
        
        addComment: function() {
            var text = $('input.question-input', this.el).val()
            if (!text.length > 0)
                return;
            
            this.comments.add(new Comment({body: text}));
            $('input.question-input', this.el).val("");
        },

        addLike: function() {
            if (!this.hasVoted) {
                var currentVotes = this.model.incrementVotes();
                $('.question-meta-like .meta-value', this.el).html(currentVotes);
                $('.question-meta-like', this.el).addClass('liked');
                this.hasVoted = true;
            }
        },
        
        toggleComments: function() {
            $('.question-answers', this.el).toggle();
            $('.question-form', this.el).toggle();
        },
        
        appendComment: function(comment) {
            $('.question-answers', this.el).append(new CommentView({model: comment}).el);
            $('.question-meta-answers .meta-value', this.el).html(this.comments.size());
        },
        
        render: function() {
            $(this.el).html(_.template(
                $('#question-template').text(),
                {
                    body: this.model.get('body'),
                    likes: this.model.get('votes'),
                    comment_count: this.comments.size()
                })
            );
            
            _.each(this.comments.models, function(comment) {
                this.appendComment(comment);
            });
            
            return this;
        }
    });
    
    var AppView = Backbone.View.extend({
        el: $('#main'),
        questions_container: $('#questions-set', this.el),
        events: {
            'keyup #search-field': 'filterQuestions',
            'submit #questions-add' : 'addQuestion',
            'click #filter-likes' : 'filterLikes',
            'click #filter-answers' : 'filterAnswers'
        },
        
        filterLikes: function() {
            if (this.currentFilter == 1)
                this.currentFilter = 2;
            else
                this.currentFilter = 1;
            this.updateFilterStyle();
        },
        
        filterAnswers: function() {
            if (this.currentFilter == 3)
                this.currentFilter = 4;
            else
                this.currentFilter = 3;
            this.updateFilterStyle();
        },
        
        updateFilterStyle: function() {
            var value = this.currentFilter;

        	// remove all classes
        	$('#filter-likes').removeClass('arrowUp arrowDown');
        	$('#filter-answers').removeClass('arrowUp arrowDown');

        	if (value == 1) {
        		$('#filter-likes').addClass('arrowDown');
        		return;
        	}
        	if (value == 2) {
        		$('#filter-likes').addClass('arrowUp');
        		return;
        	}
        	if (value == 3) {
        		$('#filter-answers').addClass('arrowDown');
        		return;
        	}
        	if (value == 4) {
        		$('#filter-answers').addClass('arrowUp');
        		return;
        	}
        },
        
        addQuestion: function() {
            var text = $('#questions-add-input', this.el).val();
            if (!text.length > 0)
                return;
            
            this.questions.add(new Question({body: text}));
            $('#questions-add-input', this.el).val('');
        },

        initialize: function() {
            _.bindAll(this, 'filterQuestions', 'render', 'renderQuestion', 'addQuestion', 'filterLikes', 'filterAnswers', 'updateFilterStyle');
            this.questions = new QuestionCollection();
            this.currentFilter = 1;
            
            this.questions.bind('add', this.renderQuestion);
        },

        filterQuestions: function() {
            console.log("OK");  
        },

        render: function() {
            _.each(this.questions.models, function(question){
                this.renderQuestion(question);
            })
        },

        renderQuestion: function(question) {
            $(this.questions_container).append(new QuestionView({model: question}).el);
        }
    });

    window.App = new AppView();

    function addQuestion(text) {
        window.App.questions.add(new Question({body: text}));
    }

    $('#demo-box button').click(function(){
         addQuestion("What is the difference between polling and hardware timers?");
         addQuestion("Is polling resource intensive");
         addQuestion("Why is this relevant to the PIC24");
         addQuestion("Havent we already covered this? similar to last lecture. What is new?");
         $('#demo-box').fadeOut('slow');
    });
    
})(jQuery);

