from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import FileSystemStorage
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
        else:
            try:
                img = Image.open(BytesIO(uploaded_file.read()))
                img.verify()  # 验证文件是否损坏
            except (IOError, SyntaxError) as e:
                return JsonResponse({'status': 'error', 'message': '不支持的文件格式或图像文件损坏'}, status=400)

        # 限制文件大小或自动压缩压缩 TODO

        file_ext = uploaded_file.name.split('.')[-1]
        md5_filename = hashlib.md5((uploaded_file.name + str(time.time())).encode()).hexdigest()
        encrypted_file_name = f"{md5_filename}.{file_ext}"

        fs = FileSystemStorage()
        filename = fs.save(encrypted_file_name, uploaded_file)
        uploaded_file_url = fs.url(filename)

        file_instance = UserFile(file_name=encrypted_file_name, user=request.user)
        file_instance.save()

        return JsonResponse({'status': 'success', 'url': uploaded_file_url})
    return JsonResponse({'status': 'error', 'message': '未知错误'}, status=400)
