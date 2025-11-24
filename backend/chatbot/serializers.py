
# from rest_framework import serializers
# from .models import Conversation, ChatMessage, Result


# class ChatMessageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ChatMessage
#         fields = '__all__'
#         read_only_fields = ('created_at',)


# class ConversationSerializer(serializers.ModelSerializer):
#     messages = ChatMessageSerializer(many=True, read_only=True)

#     class Meta:
#         model = Conversation
#         fields = '__all__'
#         # 🔹 Student should be read-only since it's set automatically
#         read_only_fields = ('start_date', 'student')


# class ResultSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Result
#         fields = '__all__'
#         # 🔹 Student should be read-only as well
#         read_only_fields = ('date', 'student')


from rest_framework import serializers
from .models import Conversation, ChatMessage, Result, ConversationFeedback
from ejercicios.serializers import LessonSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer para mensajes individuales"""
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'conversation', 'sender', 'text', 
            'created_at', 'metadata', 'tokens_used',
            'response_time_ms', 'rating'
        ]
        read_only_fields = ('id', 'created_at', 'tokens_used', 'response_time_ms')


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listar conversaciones"""
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    accuracy = serializers.FloatField(read_only=True)
    message_count = serializers.IntegerField(
        source='messages.count', 
        read_only=True
    )
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'student_name', 'lesson', 'lesson_title',
            'title', 'mode', 'start_date', 'last_activity',
            'is_active', 'total_questions', 'correct_answers',
            'accuracy', 'message_count'
        ]


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer para conversaciones completas"""
    messages = ChatMessageSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_info = LessonSerializer(source='lesson', read_only=True)
    accuracy = serializers.FloatField(read_only=True)
    message_count = serializers.IntegerField(
        source='messages.count', 
        read_only=True
    )
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'student', 'student_name', 'lesson', 'lesson_info',
            'title', 'mode', 'start_date', 'last_activity', 
            'context', 'is_active', 'total_questions', 
            'correct_answers', 'accuracy', 'messages', 'message_count'
        ]
        read_only_fields = (
            'id', 'student', 'student_name', 'start_date', 
            'last_activity', 'total_questions', 'correct_answers'
        )


class ResultSerializer(serializers.ModelSerializer):
    """Serializer para resultados"""
    student_name = serializers.CharField(source='student.username', read_only=True)
    question_text = serializers.CharField(source='question.text', read_only=True)
    
    class Meta:
        model = Result
        fields = [
            'id', 'student', 'student_name', 'question', 
            'question_text', 'conversation', 'sent_answer',
            'correct', 'date', 'time_taken_seconds', 'attempts'
        ]
        read_only_fields = ('id', 'student', 'date')


class ConversationFeedbackSerializer(serializers.ModelSerializer):
    """Serializer para feedback"""
    
    class Meta:
        model = ConversationFeedback
        fields = ['id', 'conversation', 'rating', 'comment', 'created_at']
        read_only_fields = ('id', 'created_at')


class MessageRatingSerializer(serializers.Serializer):
    """Serializer para calificar mensajes"""
    rating = serializers.IntegerField(min_value=1, max_value=5)
    message_id = serializers.IntegerField()