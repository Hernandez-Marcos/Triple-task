from rest_framework import serializers

class MathSerializer(serializers.Serializer):
    answer = serializers.IntegerField()

class GridSerializer(serializers.Serializer):
    answer = serializers.ChoiceField(choices=["red", "blue"])

class PatternSerializer(serializers.Serializer):
    answer = serializers.ListField(
        child=serializers.ChoiceField(choices=["blue", "green", "yellow"]),
        min_length=3,
        max_length=3
    )