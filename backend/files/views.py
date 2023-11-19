from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import FileSystemStorage
from django.core.files.base import ContentFile
from django.http import JsonResponse

from PIL import Image
from io import BytesIO
import hashlib
import time

from .models import UserFile

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated]) 
def files_upload(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file', False)

        # 限制文件类型
        if not uploaded_file.content_type.startswith('image/'):
            return JsonResponse({'status': 'error', 'message': '不支持的文件格式'}, status=400)
        file_ext = uploaded_file.name.split('.')[-1]
        if not file_ext.lower() in ['bmp', 'jpeg', 'jpg', 'png']:
            return JsonResponse({'status': 'error', 'message': '不支持的文件格式'}, status=400)

        try:
            img = Image.open(uploaded_file)
            # 压缩图像
            longer_edge = max(img.width, img.height)
            if longer_edge > 1280:
                img.thumbnail((1280, 1280))
                original_format = img.format

                output = BytesIO()
                img.save(output, format=original_format, quality=85)
                output.seek(0)
                uploaded_file = ContentFile(output.read(), name=uploaded_file.name)
        except IOError:
            return JsonResponse({'status': 'error', 'message': '图像文件可能损坏'}, status=400)

        md5_filename = hashlib.md5((uploaded_file.name + str(time.time())).encode()).hexdigest()
        encrypted_file_name = f"{md5_filename}.{file_ext}"

        fs = FileSystemStorage()
        filename = fs.save(encrypted_file_name, uploaded_file)
        uploaded_file_url = fs.url(filename)

        file_instance = UserFile(file_name=encrypted_file_name, user=request.user)
        file_instance.save()

        return JsonResponse({'status': 'success', 'url': uploaded_file_url})
    return JsonResponse({'status': 'error', 'message': '未知错误'}, status=400)
