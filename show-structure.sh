#!/bin/bash

# Bank Application 프로젝트 구조 확인 스크립트

echo "🏦 Bank Application 프로젝트 구조"
echo "================================="
echo ""

# 프로젝트 루트 디렉토리
PROJECT_ROOT="/Users/gossing/WorkPlace/bank-app"

# 트리 구조 출력 (tree 명령어가 없는 경우를 대비한 대체 구현)
show_tree() {
    local dir="$1"
    local prefix="$2"
    local last="$3"
    
    echo "${prefix}${last}${dir##*/}/"
    
    local new_prefix="${prefix}"
    if [ "$last" = "└── " ]; then
        new_prefix="${prefix}    "
    else
        new_prefix="${prefix}│   "
    fi
    
    local items=("$dir"/*)
    local count=${#items[@]}
    local i=0
    
    for item in "${items[@]}"; do
        ((i++))
        if [ -e "$item" ]; then
            if [ $i -eq $count ]; then
                if [ -d "$item" ]; then
                    show_tree "$item" "$new_prefix" "└── "
                else
                    echo "${new_prefix}└── ${item##*/}"
                fi
            else
                if [ -d "$item" ]; then
                    show_tree "$item" "$new_prefix" "├── "
                else
                    echo "${new_prefix}├── ${item##*/}"
                fi
            fi
        fi
    done
}

# 프로젝트 구조 표시
cd "$PROJECT_ROOT" || exit 1

echo "📁 $PROJECT_ROOT"
for item in */; do
    echo "├── $item"
    # 주요 파일만 표시
    for file in "$item"/{README.md,build.gradle,Dockerfile,package.json}; do
        if [ -f "$file" ]; then
            echo "│   └── ${file##*/}"
        fi
    done
done

# 주요 파일 표시
for file in *.{yml,md}; do
    if [ -f "$file" ]; then
        echo "├── $file"
    fi
done

echo ""
echo "📊 서비스 구성"
echo "============="
echo ""
echo "Backend Services:"
echo "  - Discovery Service (Eureka) : 8761"
echo "  - Gateway Service           : 8080"
echo "  - User Service             : 8081"
echo "  - Account Service          : 8082"
echo "  - Product Service          : 8083"
echo ""
echo "Frontend:"
echo "  - React Application        : 3000"
echo ""
echo "Infrastructure:"
echo "  - PostgreSQL (User)        : 15432"
echo "  - PostgreSQL (Account)     : 25432"
echo "  - PostgreSQL (Product)     : 35432"
echo "  - RabbitMQ                 : 5672"
echo "  - RabbitMQ Management      : 15672"
echo "  - Adminer                  : 18080"
echo ""
echo "🚀 실행 방법"
echo "==========="
echo ""
echo "1. Docker Compose로 전체 실행:"
echo "   cd $PROJECT_ROOT"
echo "   docker-compose up -d"
echo ""
echo "2. 개별 서비스 실행:"
echo "   cd [service-directory]"
echo "   ./gradlew bootRun"
echo ""
echo "✅ 완료!"
