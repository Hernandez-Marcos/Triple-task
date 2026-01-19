from rest_framework import serializers

class mathSerializer(serializers.Serializer):
    answer = serializers.IntegerField()

class gridSerializer(serializers.Serializer):
    answer = serializers.ChoiceField(choices=["red", "blue"])