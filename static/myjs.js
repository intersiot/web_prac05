// 좋아요 업데이트 함수 클라이언트
function toggle_like(post_id, type) {
    console.log(post_id, type)
    let $a_like = $(`#${post_id} a[aria-label='${type}']`)
    let $i_like = $a_like.find("i")

    let full_icons = {
        "heart": "fa-heart",
        "star": "fa-star",
        "like": "fa-thumbs-up"
    }
    let empty_icons = {
        "heart": "fa-heart-o",
        "star": "fa-star-o",
        "like": "fa-thumbs-o-up"
    }

    if ($i_like.hasClass(full_icons[type])) {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "unlike"
            },
            success: function (response) {
                console.log("unlike")
                // 꽉찬하트를 빼고 빈하트를 추가하겠다.
                $i_like.addClass(empty_icons[type]).removeClass(full_icons[type])
                // $a_like.find("span.like-num").text(response["count"])
                $a_like.find("span.like-num").text(num2str(response)["count"])
            }
        })
    } else {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "like"
            },
            success: function (response) {
                console.log("like")
                // 빈하트를 빼고 꽉찬하트를 추가하겠다.
                $i_like.addClass(full_icons[type]).removeClass(empty_icons[type])
                // $a_like.find("span.like-num").text(response["count"])
                $a_like.find("span.like-num").text(num2str(response)["count"])
            }
        })

    }
}

// 클라이언트 포스팅 함수
function post() {
    let comment = $("#textarea-post").val() // 모달에 입력된 값을 불러옴
    let today = new Date().toISOString()    // 작성된 날짜
    $.ajax({
        type: "POST",
        url: "/posting",
        data: {
            comment_give: comment,
            date_give: today
        },
        success: function (response) {
            $("#modal-post").removeClass("is-active") // 모달을 닫는다.
            window.location.reload() // 새로고침
        }
    })
}

// 숫자 형식 바꾸기
function num2str(count) {
    if (count > 10000) {
        return parseInt(count / 1000) + "k"
    }
    if (count > 500) {
        return parseInt(count / 100) / 10 + "k"
    }
    if (count == 0) {
        return ""
    }
    return count
}

// 포스팅 카드 만들기
function get_posts(username) {
    // username이 없다면
    if (username == undefined) {
        username = ""
    }
    $("#post-box").empty() // 포스팅 박스를 비운다.
    $.ajax({
        type: "GET",
        url: `/get_posts?username_give=${username}`,
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let posts = response["posts"]
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i]
                    let time_post = new Date(post["date"])
                    // 얼마전에 작성됐는지
                    let time_before = time2str(time_post)
                    // 하트(좋아요) if문
                    // let class_heart = ""
                    // if (post["heart_by_me"]) {
                    //     class_heart = "fa-heart"
                    // } else {
                    //     class_heart = "fa-heart-o"
                    // }
                    // 조건부 삼항연산자
                    let class_heart = post['heart_by_me'] ? "fa-heart": "fa-heart-o"
                    // 즐겨찾기
                    let class_star = post['star_by_me'] ? "fa-star": "fa-star-o"
                    // 추천
                    let class_thumbs = post['thumbs_by_me'] ? "fa-thumbs-up" : "fa-thumbs-o-up"
                    // 좋아요, 즐겨찾기, 추천수 세기
                    let count_heart = post['count_heart']
                    let count_star = post['count_star']
                    let count_thumbs = post['count_thumbs']
                    let html_temp = `<div class="box" id="${post["_id"]}">
                                        <article class="media">
                                            <div class="media-left">
                                                <a class="image is-64x64" href="/user/${post['username']}">
                                                    <img class="is-rounded" src="/static/${post['profile_pic_real']}" alt="Image">
                                                </a>
                                            </div>
                                            <div class="media-content">
                                                <div class="content">
                                                    <p>
                                                        <strong>${post['profile_name']}</strong> <small>@${post['username']}</small> <small>${time_before}</small>
                                                        <br>
                                                        ${post['comment']}
                                                    </p>
                                                </div>
                                                <nav class="level is-mobile">
                                                    <div class="level-left">
                                                        <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like('${post['_id']}', 'heart')">
                                                            <span class="icon is-small"><i class="fa ${class_heart}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span class="like-num">${num2str(count_heart)}</span>
                                                        </a>
                                                        <a class="level-item is-sparta" aria-label="star" onclick="toggle_like('${post['_id']}', 'star')">
                                                            <span class="icon is-small"><i class="fa ${class_star}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span class="like-num">${num2str(count_star)}</span>
                                                        </a>
                                                        <a class="level-item is-sparta" aria-label="thumbs" onclick="toggle_like('${post['_id']}', 'thumbs')">
                                                            <span class="icon is-small"><i class="fa ${class_thumbs}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span class="like-num">${num2str(count_thumbs)}</span>
                                                        </a>
                                                    </div>
                                                </nav>
                                            </div>
                                        </article>
                                    </div>`
                    $("#post-box").append(html_temp)
                }
            }
        }
    })
}

// 포스팅 시간 나타내기
function time2str(date) {
    let today = new Date()
    let time = (today - date) / 1000 / 60  // 분
    // 60분이 넘어가는 경우
    if (time < 60) {
        return parseInt(time) + "분 전"
    }
    // 24시간이 넘어가는 경우
    time = time / 60  // 시간
    if (time < 24) {
        return parseInt(time) + "시간 전"
    }
    // 7일 이상일 경우 작성 날짜가 보이도록
    time = time / 24
    if (time < 7) {
        return parseInt(time) + "일 전"
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}
