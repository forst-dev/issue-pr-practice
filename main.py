def get_welcome_message(user_list):
    if not user_list:
        return "일반 유저 로그인 성공"
    
    first_user = user_list[0] 
    print(f"첫 번째 사용자 {first_user}님 환영합니다.")
    
    admin_count = 0
    for user in user_list:
        if user == "admin":
            admin_count += 1
            
    if admin_count > 0:
        return "관리자 로그인 성공"
    return "일반 유저 로그인 성공"