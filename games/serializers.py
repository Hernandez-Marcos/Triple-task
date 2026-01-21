from rest_framework import serializers

class MathSerializer(serializers.Serializer):
    answer = serializers.IntegerField()

class GridSerializer(serializers.Serializer):
    answer = serializers.ChoiceField(choices=["red", "blue"])