import openai
import tenacity
from .configs import OPENAI_KEY

openai.api_key = OPENAI_KEY

@tenacity.retry(stop=tenacity.stop_after_attempt(3), 
                wait=tenacity.wait_random_exponential(min=1, max=10),
                retry=tenacity.retry_if_exception_type((openai.error.RateLimitError, openai.error.OpenAIError)))
def interact_with_gpt(msg: list, model_engine = 'gpt-3.5-turbo', temperature=0, max_tokens=2000) ->str:
    """与openai的语言模型交互
    @msg 用户发送的信息,封装成字典的形式
    需要是如下的结构
    [ {'role':'system', 'content':"xxx"},
      {'role':'user', 'content':"xxx"}
      {'role':'assistant', 'content':"xxx"}
    ]
    system表示对系统的指示,提供整体的指导方针,如"你是学习助手,你的任务是帮助用户学习"，之后输入用户和gpt的多轮对话;
    user表示用户的输入,可以有多轮对话;
    assistant表示gpt的回复,可以是多轮的对话

    @model_engine 语言模型的名字

    @temperature 代表了回复的自由度,越大则回复的内容越自由. 如果需要要可预测的回复内容,可以设置为0,每次回复的内容相同; 
    如果需要更加自由的回复,可以设置为1,每次回复的内容都不同

    @max_tokens 代表了回复的最大长度,如果设置为0,则回复的内容为空;
    @return(flag, response) flag为真表示无错误，response为语言模型的回复或错误JSON
    """
    try:
        response = openai.ChatCompletion.create(
            model = model_engine,
            messages = msg,
            temperature = temperature,
            max_tokens = max_tokens,
        )
        print(response['usage'])
        return True, response['choices'][0]['message']['content']
    except openai.error.InvalidRequestError as e:
        return False, {'error':'Invalid Request'}
    except openai.error.AuthenticationError as e:
        return False, {'error':'Invalid Authentication'}
    except openai.error.RateLimitError as e:
        print(e)
        return False, {'error':'API受限，请稍作等待后重试，若一直受限请联系管理员'}
    except openai.error.OpenAIError as e:
        print(e)
        return False, {'error':'API或网络错误，请稍作等待后重试'}
    except Exception as e:
        print(e)
        return False, {'error':'服务器遇到未知错误'}