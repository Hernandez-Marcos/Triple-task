from rest_framework import serializers

class mathSerializer(serializers.Serializer):
    answer = serializers.IntegerField()