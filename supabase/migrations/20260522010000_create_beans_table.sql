create table if not exists beans (
  id          text primary key,
  name        text not null,
  name_en     text not null,
  origin      text not null,
  region      text not null,
  variety     text not null,
  process     text not null,
  roast       text not null,
  notes       text[] not null default '{}',
  body        text not null,
  acidity     text not null,
  description text not null,
  flag        text not null,
  special     text,
  created_at  timestamptz default now()
);

alter table beans enable row level security;

create policy "public can read beans"
  on beans for select using (true);

insert into beans (id, name, name_en, origin, region, variety, process, roast, notes, body, acidity, description, flag, special) values
(
  'panama-geisha', '파나마 게이샤', 'Panama Geisha', '파나마', '보케테 (Boquete)',
  '게이샤 (Gesha)', '워시드', 'light',
  array['자스민','복숭아','얼그레이','망고','파파야'],
  '가벼움', '밝고 산뜻한 산미',
  '세계에서 가장 유명한 스페셜티 원두. 꽃향기와 열대과일의 화려한 컵 프로파일.',
  '🇵🇦', '세계 최고가 원두 중 하나'
),
(
  'ethiopia-yirgacheffe', '에티오피아 예가체프', 'Ethiopia Yirgacheffe', '에티오피아', '예가체프 (Yirgacheffe)',
  '에티오피아 에어룸', '워시드', 'light',
  array['베르가못','레몬','자스민','복숭아','허브'],
  '가벼움-중간', '밝고 과일향 산미',
  '스페셜티 커피의 아이콘. 깔끔한 워시드 공정으로 꽃향기와 시트러스가 두드러짐.',
  '🇪🇹', null
),
(
  'ethiopia-guji-natural', '에티오피아 구지 내추럴', 'Ethiopia Guji Natural', '에티오피아', '구지 (Guji)',
  '에티오피아 에어룸', '내추럴', 'light',
  array['블루베리','딸기','다크초콜릿','레드와인','장미'],
  '중간-풀바디', '와인 같은 산미',
  '내추럴 가공의 정수. 발효된 과일의 진하고 복잡한 풍미가 인상적.',
  '🇪🇹', null
),
(
  'kenya-aa', '케냐 AA', 'Kenya AA', '케냐', '키리냐가 (Kirinyaga)',
  'SL28, SL34', '워시드', 'light',
  array['블랙커런트','자몽','토마토','레드와인','카시스'],
  '풀바디', '강하고 복잡한 산미',
  'AA는 최대 등급의 스크린 사이즈를 의미. 케냐 특유의 묵직한 바디와 강렬한 과일 산미.',
  '🇰🇪', null
),
(
  'colombia-narino', '콜롬비아 나리뇨', 'Colombia Nariño', '콜롬비아', '나리뇨 (Nariño)',
  '카스티요, 카투라', '워시드', 'medium',
  array['캐러멜','헤이즐넛','사과','오렌지','브라운슈거'],
  '중간', '밝고 달콤한 산미',
  '해발 2,000m 이상 고지대에서 자란 원두. 균형 잡힌 단맛과 견과류 풍미.',
  '🇨🇴', null
),
(
  'jamaica-blue-mountain', '자메이카 블루마운틴', 'Jamaica Blue Mountain', '자메이카', '블루마운틴 (Blue Mountain)',
  '티피카', '워시드', 'medium',
  array['크림','견과류','밀크초콜릿','허브','달콤한 향신료'],
  '풀바디', '부드럽고 낮은 산미',
  '세계 3대 커피 중 하나. 쓴맛·신맛·단맛이 완벽히 균형을 이루는 부드러운 원두.',
  '🇯🇲', '엄격한 생산량 규제로 희소성 높음'
),
(
  'yemen-mocha-mattari', '예멘 모카 마타리', 'Yemen Mocha Mattari', '예멘', '바니 마타르 (Bani Matar)',
  '티피카 (예멘 에어룸)', '내추럴', 'medium',
  array['다크초콜릿','블루베리','레드와인','스파이시','흙향'],
  '풀바디', '와인 같은 복잡한 산미',
  '커피 역사의 기원. 수백 년간 변하지 않은 전통 재배 방식으로 독특한 야생미를 지님.',
  '🇾🇪', '커피 무역의 발상지'
),
(
  'sumatra-mandheling', '수마트라 만델링', 'Sumatra Mandheling', '인도네시아', '북 수마트라 (North Sumatra)',
  '티피카, 카투라', '웻헐드', 'dark',
  array['다크초콜릿','삼나무','흙향','허브','담배'],
  '매우 풀바디', '낮은 산미',
  '웻헐드 공정 특유의 묵직하고 어시(earthy)한 풍미. 에스프레소 블렌드의 베이스로 인기.',
  '🇮🇩', null
),
(
  'costa-rica-tarrazu', '코스타리카 타라주', 'Costa Rica Tarrazu', '코스타리카', '타라주 (Tarrazú)',
  '카투라, 카투아이', '허니', 'medium',
  array['밀크초콜릿','오렌지','사과','브라운슈거','카라멜'],
  '중간-풀바디', '균형 잡힌 산미',
  '허니 프로세스로 단맛이 살아있는 코스타리카 대표 원두. 클린하면서도 풍성한 풍미.',
  '🇨🇷', null
),
(
  'guatemala-antigua', '과테말라 안티구아', 'Guatemala Antigua', '과테말라', '안티구아 (Antigua)',
  '부르봉, 카투라', '워시드', 'medium',
  array['다크초콜릿','브라운슈거','스모키','아몬드','오렌지필'],
  '중간-풀바디', '부드러운 산미',
  '화산 토양과 독특한 기후가 만든 풍미. 달콤한 초콜릿 노트와 은은한 스모키함.',
  '🇬🇹', null
),
(
  'hawaii-kona', '하와이 코나', 'Hawaii Kona', '미국 (하와이)', '코나 (Kona Coast)',
  '티피카', '워시드', 'medium',
  array['마카다미아','브라운슈거','밝은 산미','버터','꿀'],
  '중간', '밝고 깔끔한 산미',
  '세계 3대 커피 중 하나. 마우나로아 화산 기슭에서 재배. 풍부한 향과 부드러운 맛.',
  '🇺🇸', '미국 본토 유일의 상업 커피 산지'
),
(
  'burundi-bourbon', '부룬디 부르봉', 'Burundi Bourbon', '부룬디', '응코라 (Ngozi)',
  '레드 부르봉', '워시드', 'light',
  array['자두','흑설탕','캐러멜','복숭아','레드티'],
  '중간', '달콤하고 과일향 나는 산미',
  '아프리카 숨겨진 보석. 부르봉 품종 특유의 단맛과 복잡한 과일 노트.',
  '🇧🇮', '스페셜티 업계 주목 신흥 산지'
);
